const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STRENGTH_FACTORS = {
  weak: 1.35,
  medium: 1,
  strong: 0.8
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundHours(value) {
  return Number(value.toFixed(1));
}

function normalizeInput(input) {
  const subjects = Array.isArray(input.subjects)
    ? input.subjects
        .filter((subject) => subject && typeof subject.name === "string" && subject.name.trim())
        .map((subject) => ({
          name: subject.name.trim(),
          priority: clamp(Number(subject.priority) || 3, 1, 5),
          strength: ["strong", "medium", "weak"].includes(subject.strength) ? subject.strength : "medium"
        }))
    : [];

  const availability = Array.isArray(input.availability)
    ? input.availability.map((entry) => ({
        day: DAYS.includes(entry.day) ? entry.day : "Monday",
        hours: clamp(Number(entry.hours) || 0, 0, 12),
        preferred_slots: Array.isArray(entry.preferred_slots) && entry.preferred_slots.length ? entry.preferred_slots : ["Evening"]
      }))
    : [];

  const fixedCommitments = Array.isArray(input.fixed_commitments)
    ? input.fixed_commitments
        .filter((entry) => entry && DAYS.includes(entry.day) && (Number(entry.hours) || 0) > 0)
        .map((entry) => ({
          day: entry.day,
          label: typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : "Fixed commitment",
          hours: clamp(Number(entry.hours) || 0, 0, 12)
        }))
    : [];

  return {
    plan_name: typeof input.plan_name === "string" && input.plan_name.trim() ? input.plan_name.trim() : "Study timetable",
    exam_slug: typeof input.exam_slug === "string" && input.exam_slug.trim() ? input.exam_slug.trim() : "custom",
    subjects,
    availability,
    fixed_commitments: fixedCommitments,
    session_length: clamp(Number(input.session_length) || 60, 30, 180),
    revision_style: ["daily", "weekly", "both", "none"].includes(input.revision_style) ? input.revision_style : "both",
    mock_frequency: ["weekly", "biweekly", "none"].includes(input.mock_frequency) ? input.mock_frequency : "weekly",
    exam_date: typeof input.exam_date === "string" && input.exam_date.trim() ? input.exam_date.trim() : undefined,
    notes: typeof input.notes === "string" ? input.notes.trim() : ""
  };
}

function getActiveDays(availability, commitments) {
  return DAYS.map((day) => {
    const source = availability.find((entry) => entry.day === day) || { day, hours: 0, preferred_slots: ["Evening"] };
    const blockedHours = commitments
      .filter((entry) => entry.day === day)
      .reduce((sum, entry) => sum + entry.hours, 0);
    const freeHours = clamp(source.hours - blockedHours, 0, 12);
    return {
      day,
      hours: freeHours,
      preferred_slots: source.preferred_slots && source.preferred_slots.length ? source.preferred_slots : ["Evening"]
    };
  }).filter((entry) => entry.hours > 0);
}

function calculateReserveSessions(activeDays, revisionStyle, mockFrequency) {
  const totalSessions = activeDays.reduce((sum, day) => sum + day.session_count, 0);
  const dailyRevisionSessions = revisionStyle === "daily" || revisionStyle === "both" ? activeDays.length : 0;
  const weeklyRevisionSessions = revisionStyle === "weekly" ? Math.min(2, totalSessions) : revisionStyle === "both" ? Math.min(1, totalSessions) : 0;
  const mockSessions = mockFrequency === "weekly" ? Math.min(2, totalSessions) : mockFrequency === "biweekly" ? Math.min(1, totalSessions) : 0;

  const cappedRevision = Math.min(dailyRevisionSessions + weeklyRevisionSessions, Math.max(0, totalSessions - 1));
  const cappedMocks = Math.min(mockSessions, Math.max(0, totalSessions - cappedRevision - 1));

  return {
    totalSessions,
    dailyRevisionSessions,
    weeklyRevisionSessions: cappedRevision - dailyRevisionSessions,
    mockSessions: cappedMocks,
    studySessions: Math.max(1, totalSessions - cappedRevision - cappedMocks)
  };
}

function distributeStudySessions(subjects, totalStudySessions) {
  const weightedSubjects = subjects.map((subject) => ({
    ...subject,
    weight: subject.priority * (STRENGTH_FACTORS[subject.strength] || 1)
  }));
  const totalWeight = weightedSubjects.reduce((sum, subject) => sum + subject.weight, 0) || 1;
  const provisional = weightedSubjects.map((subject) => {
    const exactShare = (subject.weight / totalWeight) * totalStudySessions;
    const base = Math.floor(exactShare);
    return {
      ...subject,
      exactShare,
      sessions: base,
      remainder: exactShare - base
    };
  });

  let assigned = provisional.reduce((sum, subject) => sum + subject.sessions, 0);
  provisional.sort((left, right) => right.remainder - left.remainder);

  while (assigned < totalStudySessions) {
    const target = provisional[assigned % provisional.length];
    target.sessions += 1;
    assigned += 1;
  }

  provisional.forEach((subject) => {
    if (subject.sessions === 0) {
      subject.sessions = 1;
    }
  });

  while (provisional.reduce((sum, subject) => sum + subject.sessions, 0) > totalStudySessions) {
    const target = [...provisional]
      .sort((left, right) => right.sessions - left.sessions)[0];

    if (target.sessions > 1) {
      target.sessions -= 1;
    } else {
      break;
    }
  }

  return provisional.map((subject) => ({
    name: subject.name,
    strength: subject.strength,
    remaining_sessions: subject.sessions
  }));
}

function createSlotLabel(preferredSlots, index) {
  const source = preferredSlots[index % preferredSlots.length] || "Study block";
  const cycle = Math.floor(index / Math.max(preferredSlots.length, 1)) + 1;
  return `${source} ${cycle}`;
}

function pickNextSubject(subjectPool) {
  const candidates = subjectPool
    .filter((subject) => subject.remaining_sessions > 0)
    .sort((left, right) => {
      if (right.remaining_sessions !== left.remaining_sessions) {
        return right.remaining_sessions - left.remaining_sessions;
      }

      const strengthOrder = { weak: 3, medium: 2, strong: 1 };
      return (strengthOrder[right.strength] || 0) - (strengthOrder[left.strength] || 0);
    });

  const nextSubject = candidates[0];
  if (!nextSubject) {
    return null;
  }

  nextSubject.remaining_sessions -= 1;
  return nextSubject;
}

function buildSubjectFocus(subject) {
  if (subject.strength === "weak") {
    return `Deep repair session for ${subject.name} with problem review and active recall.`;
  }

  if (subject.strength === "strong") {
    return `Timed performance session for ${subject.name} to keep it sharp without over-allocating hours.`;
  }

  return `Balanced study block for ${subject.name} with concept work followed by practice.`;
}

function chooseWeekendDay(activeDays) {
  return activeDays.find((day) => day.day === "Saturday") || activeDays.find((day) => day.day === "Sunday") || activeDays[activeDays.length - 1];
}

function chooseWeeklyRevisionDay(activeDays) {
  return activeDays.find((day) => day.day === "Sunday") || activeDays[activeDays.length - 1];
}

function generateTimetable(input) {
  const normalized = normalizeInput(input);
  if (!normalized.subjects.length) {
    throw new Error("Add at least one subject to generate a timetable.");
  }

  const activeDays = getActiveDays(normalized.availability, normalized.fixed_commitments).map((day) => ({
    ...day,
    session_count: Math.floor((day.hours * 60) / normalized.session_length)
  })).filter((day) => day.session_count > 0);

  if (!activeDays.length) {
    throw new Error("Add at least one day with enough free time for a study session.");
  }

  const reserve = calculateReserveSessions(activeDays, normalized.revision_style, normalized.mock_frequency);
  const subjectPool = distributeStudySessions(normalized.subjects, reserve.studySessions);
  const weekendDay = chooseWeekendDay(activeDays);
  const weeklyRevisionDay = chooseWeeklyRevisionDay(activeDays);
  let remainingMockSessions = reserve.mockSessions;
  let remainingWeeklyRevisionSessions = reserve.weeklyRevisionSessions;

  const sessions = [];

  activeDays.forEach((day) => {
    for (let slotIndex = 0; slotIndex < day.session_count; slotIndex += 1) {
      const slot = createSlotLabel(day.preferred_slots, slotIndex);
      const isLastSession = slotIndex === day.session_count - 1;
      const shouldPlaceMock = remainingMockSessions > 0 && weekendDay && day.day === weekendDay.day && slotIndex < reserve.mockSessions;
      const shouldPlaceDailyRevision = (normalized.revision_style === "daily" || normalized.revision_style === "both") && isLastSession;
      const shouldPlaceWeeklyRevision = remainingWeeklyRevisionSessions > 0 && weeklyRevisionDay && day.day === weeklyRevisionDay.day && !shouldPlaceDailyRevision;

      if (shouldPlaceMock) {
        sessions.push({
          day: day.day,
          slot,
          duration_minutes: normalized.session_length,
          subject: normalized.exam_slug === "custom" ? normalized.plan_name : normalized.exam_slug.toUpperCase(),
          type: "mock",
          focus: remainingMockSessions > 1 ? "Full mock simulation and post-test review." : "Sectional mock with targeted analysis."
        });
        remainingMockSessions -= 1;
        continue;
      }

      if (shouldPlaceDailyRevision || shouldPlaceWeeklyRevision) {
        sessions.push({
          day: day.day,
          slot,
          duration_minutes: normalized.session_length,
          subject: "Revision",
          type: "revision",
          focus: normalized.revision_style === "daily" || normalized.revision_style === "both"
            ? "Active recall, short notes cleanup, and error-log revision."
            : "Weekly consolidation block covering weak topics and formulas."
        });
        if (shouldPlaceWeeklyRevision) {
          remainingWeeklyRevisionSessions -= 1;
        }
        continue;
      }

      const subject = pickNextSubject(subjectPool) || subjectPool[0];
      sessions.push({
        day: day.day,
        slot,
        duration_minutes: normalized.session_length,
        subject: subject.name,
        type: "study",
        focus: buildSubjectFocus(subject)
      });
    }
  });

  const weeklyHours = roundHours(sessions.reduce((sum, session) => sum + session.duration_minutes, 0) / 60);
  const subjectHours = normalized.subjects.map((subject) => ({
    subject: subject.name,
    hours: roundHours(sessions.filter((session) => session.type === "study" && session.subject === subject.name).reduce((sum, session) => sum + session.duration_minutes, 0) / 60)
  })).filter((entry) => entry.hours > 0);

  const rationale = [];
  const weakestSubjects = normalized.subjects.filter((subject) => subject.strength === "weak").map((subject) => subject.name);
  if (weakestSubjects.length) {
    rationale.push(`Extra study density was given to weak subjects like ${weakestSubjects.join(", ")}.`);
  }
  rationale.push(`Session length is capped at ${normalized.session_length} minutes to keep the plan realistic.`);
  if (normalized.revision_style !== "none") {
    rationale.push(`Revision blocks were inserted with a ${normalized.revision_style} revision rhythm.`);
  }
  if (normalized.mock_frequency !== "none") {
    rationale.push(`Mock practice was reserved on the weekend using a ${normalized.mock_frequency} cadence.`);
  }
  if (normalized.exam_date) {
    rationale.push(`The schedule is oriented toward the target date on ${normalized.exam_date}.`);
  }

  return {
    input: normalized,
    generated_plan: {
      summary: `${normalized.plan_name} covers ${weeklyHours} study hours across ${activeDays.length} active days with space for study, revision, and mock practice.`,
      weekly_hours: weeklyHours,
      subject_hours: subjectHours,
      rationale,
      sessions
    }
  };
}

module.exports = {
  DAYS,
  generateTimetable
};
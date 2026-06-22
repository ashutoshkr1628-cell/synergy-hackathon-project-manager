function calculateStandings() {
  const completedTasks = appState.tasks.filter(t => t.status === "completed").length;
  const syncCount = appState.parcels.length;
  const isDeployedStaging = appState.team.hasDeployedStaging;
  const isDeployedProd = appState.team.hasDeployedProd;
  const isSubmitted = appState.submission.status === "submitted" || appState.submission.status === "review";
  let score = 0;
  score += completedTasks * 10;
  score += syncCount * 5;
  if (isDeployedStaging) score += 20;
  if (isDeployedProd) score += 50;
  if (isSubmitted) score += 100;
  const uxScore = parseInt(appState.submission.mentorRatingUX) || 0;
  const codeScore = parseInt(appState.submission.mentorRatingCode) || 0;
  score += (uxScore + codeScore) * 10;
  appState.team.score = score;
  const alphaMembers = appState.members.map(m => `${m.name} (${m.role})`);
  const fullTable = [{
    name: appState.team.name,
    score: appState.team.score,
    tasksDone: completedTasks,
    tasksTotal: appState.tasks.length,
    syncs: syncCount,
    deployed: isDeployedProd,
    status: appState.submission.status,
    members: alphaMembers,
    project: appState.submission.projectTitle || "Not Specified Yet",
    tagline: appState.submission.tagline || "No project tagline submitted yet.",
    mentorNotes: appState.submission.mentorComments || "Pending mentor review."
  }];
  appState.competitors.forEach(c => { fullTable.push(c); });
  fullTable.sort((a, b) => b.score - a.score);
  const idx = fullTable.findIndex(t => t.name === appState.team.name);
  appState.team.rank = idx + 1;
  saveData();
  return fullTable;
}


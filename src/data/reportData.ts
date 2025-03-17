
// Shared report data that can be imported by different components
export const reportHistoryData = [
  { 
    id: 1, 
    date: '2023-06-15', 
    status: 'Reviewed',
    completedTasks: 'Completed the UI design for the dashboard.',
    outstandingTasks: 'Need to finish the user profile section.',
    needFromManager: 'Feedback on the new layout design.',
    tomorrowPlans: 'Start implementing the feedback system.',
    busynessLevel: '5'
  },
  { 
    id: 2, 
    date: '2023-06-14', 
    status: 'Reviewed',
    completedTasks: 'Fixed bugs in the login flow.',
    outstandingTasks: 'Authentication edge cases need handling.',
    needFromManager: 'Access to the production error logs.',
    tomorrowPlans: 'Implement error tracking system.',
    busynessLevel: '4'
  },
];

// Helper functions to ensure consistent date handling
export const formatDateForStorage = (date: Date): string => {
  // Format the date without timezone conversion (YYYY-MM-DD)
  return date.toISOString().split('T')[0];
};

export const getLocalDate = (dateString: string): Date => {
  // Create a date object in local timezone from YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

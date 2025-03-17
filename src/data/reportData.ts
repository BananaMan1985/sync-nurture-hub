
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
  // Get year, month, and day components in local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Create YYYY-MM-DD format without any timezone conversion
  return `${year}-${month}-${day}`;
};

export const getLocalDate = (dateString: string): Date => {
  // Create a date object in local timezone from YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Return date object set to midnight in local timezone
  return date;
};

/**
 * =============================================================
 * courseService.js — Backend connection for Courses
 * =============================================================
 * 
 * This file contains functions that talk to the backend specifically
 * for course-related features (uploading, getting courses, deleting).
 * 
 * It uses the `api` setup from api.js to make these requests.
 * =============================================================
 */

import api from './api';

// Upload a PDF to the backend to generate an AI course
export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  // We need a special header 'multipart/form-data' when sending files
  const { data } = await api.post('/courses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return data;
};

// Get a list of all courses the user has created
export const getCourses = async () => {
  const { data } = await api.get('/courses');
  return data.courses; // We return the array of courses
};

// Get a single specific course by its ID (used on the Course Detail page)
export const getCourse = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data.course;
};

// Update the user's progress (which lessons they have completed)
export const updateProgress = async (id, completedLessons) => {
  const { data } = await api.put(`/courses/${id}/progress`, { completedLessons });
  return data;
};

// Delete a specific course
export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

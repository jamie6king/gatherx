# Q&A Feature for Attend Webinar Page

## Overview
The Q&A feature should exist as a box underneath the main screen share of the `attend_webinar` page. This feature allows attendees to ask questions, view all asked questions, and indicate interest in specific questions.

## UI Requirements

### Ask a Question
- **Enter question title**: A text input field for the user to enter the title of their question.
- **Question**: A text area for the user to enter the details of their question.
- **Submit**: A button to submit the question.

When a question is submitted, the user should automatically follow the question for response notifications.

### View All Questions
- **Tab to show all asked questions**: A tab that displays all questions asked during the webinar, rank ordered by votes.
- **Thumbs up button**: Each question should have a thumbs up button to indicate interest in an answer. Clicking this button increases the vote count and subscribes the user to the answer.

## Functionality
- **Autofollow for response notification**: Users who submit a question or indicate interest in a question (by clicking the thumbs up button) should receive notifications when there are responses to the question.
- **Vote count**: Questions should be rank ordered by the number of votes they receive. Higher voted questions appear at the top of the list.

## User Interaction
- Users can ask new questions by filling out the question title and details, then clicking the submit button.
- Users can view all questions in the dedicated tab, sorted by vote count.
- Users can indicate interest in a question by clicking the thumbs up button, which also subscribes them to notifications for that question.

## Notifications
- Users should receive notifications for responses to questions they have asked or shown interest in.

This Q&A feature aims to enhance the interactivity and engagement of attendees during webinars by providing a structured way to ask and follow up on questions.
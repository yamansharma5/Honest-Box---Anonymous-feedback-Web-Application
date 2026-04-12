import { message as Message } from '../models/user';// Importing the 'message' interface from the user model and aliasing it as 'Message' to avoid naming conflicts with the 'message' property in ApiResponse.

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>; // Optional property to include messages in the response if needed
}
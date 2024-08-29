import { ObjectId } from 'mongoose';

export interface IOurStory {
  createdBy: ObjectId; // Reference to the User
  storyContent: string;
  image: string;
}

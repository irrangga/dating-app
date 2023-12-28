import { ProfileGender } from "../constants/profile.constants";

export class CompleteProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: ProfileGender;
  likedByProfileIds: string[];
  phoneNumber: string;
  password: string;
  isPremium: boolean;
}

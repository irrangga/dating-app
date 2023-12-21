import { ProfileGender } from "../constants/profile.constants";

export class CompleteProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: ProfileGender;
  isLikedBy: string[];
  phoneNumber: string;
  password: string;
}

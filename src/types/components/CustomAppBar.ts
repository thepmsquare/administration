import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { ThemeState, User } from "../Common";

interface CustomAppBarProps {
  user: User | undefined;
  nullifyPageStateFunction: () => void | undefined;
  changeSnackbarState: React.Dispatch<
    React.SetStateAction<CustomSnackbarStateType>
  >;
  themeState: ThemeState;
  customChangeThemeState: (newThemeState: ThemeState) => void;
  isUserProfilePhotoLoading: boolean;
  userProfilePhotoURL: string | null;
}
export { CustomAppBarProps };

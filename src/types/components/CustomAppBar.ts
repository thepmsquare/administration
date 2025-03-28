import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { ThemeState, User } from "../Common";
import { IndexState } from "../pages/Index";
import { ProfileState } from "../pages/Profile";

interface CustomAppBarProps {
  user: User | undefined;
  nullifyPageStateFunction: () => void | undefined;
  changeSnackbarState: React.Dispatch<
    React.SetStateAction<CustomSnackbarStateType>
  >;
  themeState: ThemeState;
  customChangeThemeState: (newThemeState: ThemeState) => void;
}
export { CustomAppBarProps };

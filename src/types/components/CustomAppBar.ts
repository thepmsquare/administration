import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { ThemeState } from "../Common";
import { IndexState } from "../pages/Index";
import { ProfileState } from "../pages/Profile";

interface CustomAppBarProps {
  pageState: IndexState | ProfileState | null;
  setPageState: React.Dispatch<
    React.SetStateAction<IndexState | ProfileState | null>
  > | null;
  changeSnackbarState: React.Dispatch<
    React.SetStateAction<CustomSnackbarStateType>
  >;
  themeState: ThemeState;
  customChangeThemeState: (newThemeState: ThemeState) => void;
}
export { CustomAppBarProps };

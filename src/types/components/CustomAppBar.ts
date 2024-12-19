import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { User } from "../Common";

interface CustomAppBarProps {
  user: User | null;
  changeSnackbarState: React.Dispatch<
    React.SetStateAction<CustomSnackbarStateType>
  >;
}
export { CustomAppBarProps };

import * as React from "react";
import { z } from "zod";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { PaginatedTable } from "squarecomponents";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import { Button, Divider, Paper, Typography } from "@mui/material";

type UserDetails = z.infer<
  typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
>;

type SessionRow = {
  "app name": string;
  "number of sessions": number;
  logout: React.ReactNode;
};

type Props = {
  userDetails: UserDetails | null;
  sessionTableData: SessionRow[] | undefined;
  isLoggingOut: boolean;
  onLogoutAllDialogOpen: () => void;
};

const ActiveSessionsSection: React.FC<Props> = ({
  userDetails,
  sessionTableData,
  isLoggingOut,
  onLogoutAllDialogOpen,
}) => {
  return (
    <Paper
      variant="outlined"
      className="profile-sessions-card"
      component="section"
      aria-labelledby="active-sessions-title"
    >
      <div className="profile-section-header">
        <DevicesOutlinedIcon
          fontSize="small"
          color="primary"
          aria-hidden="true"
        />
        <Typography variant="h6" component="h2" id="active-sessions-title">
          active sessions
        </Typography>
      </div>
      <Divider />
      <PaginatedTable
        rows={sessionTableData || []}
        tableAriaLabel="your active sessions across apps"
        currentPageNumber={1}
        handlePageChange={() => {}}
        totalRowsCount={userDetails?.sessions.length || 0}
        isLoading={userDetails ? false : true}
        pageSize={userDetails?.sessions.length || 0}
        caption="your active sessions across apps"
        hidePaginationOnSinglePage={true}
      />
      <div>
        <Button
          color="error"
          variant="outlined"
          size="small"
          onClick={onLogoutAllDialogOpen}
          disabled={isLoggingOut}
        >
          logout from all apps
        </Button>
      </div>
    </Paper>
  );
};

export default ActiveSessionsSection;

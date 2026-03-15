import * as React from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  previewURL: string | null;
  isLoading: boolean;
  crop: Crop | undefined;
  completedCrop: PixelCrop | undefined;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onCropChange: (c: Crop) => void;
  onCropComplete: (c: PixelCrop) => void;
  onSetCrop: (c: Crop) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const ProfilePhotoUpdateDialog: React.FC<Props> = ({
  open,
  previewURL,
  isLoading,
  crop,
  completedCrop,
  imgRef,
  onCropChange,
  onCropComplete,
  onSetCrop,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="update-user-profile-photo-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="update-user-profile-photo-dialog-title">
        crop profile photo
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          pt: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          drag to adjust the crop area — the photo will be uploaded as a 1:1
          square.
        </Typography>
        {previewURL && (
          <ReactCrop
            crop={crop}
            onChange={onCropChange}
            onComplete={onCropComplete}
            aspect={1}
            circularCrop
            keepSelection
            style={{ maxHeight: "60vh", maxWidth: "100%" }}
          >
            <img
              ref={imgRef}
              src={previewURL}
              alt="crop preview"
              style={{ maxWidth: "100%", display: "block" }}
              onLoad={(e) => {
                const { naturalWidth: width, naturalHeight: height } =
                  e.currentTarget;
                const initialCrop = centerCrop(
                  makeAspectCrop(
                    { unit: "%", width: 80 },
                    1,
                    width,
                    height,
                  ),
                  width,
                  height,
                );
                onSetCrop(initialCrop);
              }}
            />
          </ReactCrop>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant={"contained" as any}
          disabled={
            isLoading ||
            !completedCrop?.width ||
            !completedCrop?.height
          }
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isLoading ? "uploading…" : "crop & upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePhotoUpdateDialog;

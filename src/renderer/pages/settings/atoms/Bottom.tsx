import React from 'react';
import { Button, Paper } from '@mui/material';

interface BottomInterface {
  OnCancelClicked: () => void;
  OnApplyClicked: () => void;
  OnOKClicked: () => void;
  applyButtonEnable: boolean;
  okButtonEnable: boolean;
}

export const Bottom: React.FC<BottomInterface> = ({
  OnCancelClicked,
  OnApplyClicked,
  OnOKClicked,
  applyButtonEnable,
  okButtonEnable,
}) => {
  return (
    <Paper sx={{ position: 'fixed', bottom: 10, right: 20 }}>
      <Button variant="outlined" sx={{ m: 1 }} onClick={OnCancelClicked}>
        Cancel
      </Button>
      <Button
        variant="outlined"
        sx={{ m: 1 }}
        disabled={!applyButtonEnable}
        onClick={OnApplyClicked}
      >
        Apply
      </Button>
      <Button
        variant="contained"
        sx={{ m: 1 }}
        onClick={OnOKClicked}
        disabled={!okButtonEnable}
      >
        OK
      </Button>
    </Paper>
  );
};

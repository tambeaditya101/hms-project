// src/components/users/UserRoleChips.jsx

import { Box, Chip, Typography } from "@mui/material";

export default function UserRoleChips({ roles, onToggle, options }) {
  return (
    <Box>
      <Typography className="font-semibold mb-2">Assign Roles</Typography>

      <Box className="flex flex-wrap gap-2">
        {options.map((role) => (
          <Chip
            key={role}
            label={role}
            clickable
            onClick={() => onToggle(role)}
            color={roles.includes(role) ? "primary" : "default"}
          />
        ))}
      </Box>
    </Box>
  );
}

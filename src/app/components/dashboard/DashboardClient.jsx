'use client';

import { Typography, Grid, Button, Box, Tooltip } from '@mui/material';
import { AddCircleOutline as CaptureIcon, Search as AuditIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardClient() {
  const router = useRouter();
  const { permissions } = useAuth();

  const hasCapturePermission = permissions.includes('capture');
  const hasAuditPermission = permissions.includes('audit');

  return (
    <Box>


      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Tooltip 
            title={!hasCapturePermission ? "No tiene permiso para capturar inventario" : ""}
            placement="top"
          >
            <span>

            </span>
          </Tooltip>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Tooltip 
            title={!hasAuditPermission ? "No tiene permiso para auditar inventario" : ""}
            placement="top"
          >

          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
} 
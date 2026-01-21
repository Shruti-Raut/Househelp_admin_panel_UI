import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Avatar, Chip, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import axios from 'axios';

import CONFIG from '../constants/Config';

const API_URL = `${CONFIG.API_URL}/auth`;

export default function Providers() {
    const [providers, setProviders] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const res = await axios.get(`${API_URL}/providers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProviders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold">Service Providers</Typography>
                <Typography color="textSecondary">View and manage all registered help providers</Typography>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Provider</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Total Earnings</TableCell>
                            <TableCell>Verification</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow key={provider._id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ mr: 2, bgcolor: provider.isVerified ? 'primary.main' : 'warning.main' }}>
                                            {provider.name[0]}
                                        </Avatar>
                                        <Typography fontWeight="500">{provider.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{provider.phone}</TableCell>
                                <TableCell>{provider.city || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip label={provider.serviceCategory || 'Unassigned'} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>₹{provider.earnings || 0}</TableCell>
                                <TableCell>
                                    {provider.isVerified ? (
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Verified"
                                            color="success"
                                            size="small"
                                        />
                                    ) : (
                                        <Chip
                                            icon={<PendingIcon />}
                                            label="Pending"
                                            color="warning"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}

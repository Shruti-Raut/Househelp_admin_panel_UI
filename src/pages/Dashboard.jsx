import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Card, CardContent, Grid, Link, Chip, AppBar, Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../constants/Config';

const API_URL = CONFIG.API_URL;

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [stats, setStats] = useState({ services: 0, bookings: 0, providers: 0 });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) navigate('/');
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [bRes, pRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/bookings/all`, config),
                // This route will be added in auth.js next
                axios.get(`${API_URL}/auth/providers`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/services`, config)
            ]);
            const sortedBookings = bRes.data.sort((a, b) => {
                if (a.date !== b.date) {
                    return b.date.localeCompare(a.date);
                }
                const slotA = a.timeSlot || "";
                const slotB = b.timeSlot || "";
                return slotB.localeCompare(slotA);
            });
            setBookings(sortedBookings);
            setProviders(pRes.data);
            setStats({
                bookings: sortedBookings.length,
                providers: pRes.data.length,
                services: sRes.data.length
            });
        } catch (err) {
            console.error(err);
        }
    };

    const verifyProvider = async (id) => {
        try {
            await axios.patch(`${API_URL}/auth/verify/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Failed to verify provider');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Dashboard Overview</Typography>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={2} sx={{ p: 3, bgcolor: '#ffffff', borderLeft: '5px solid #171C4F' }}>
                        <Typography variant="overline" color="textSecondary">Total Bookings</Typography>
                        <Typography variant="h4" fontWeight="bold" color="#171C4F">{stats.bookings}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={2} sx={{ p: 3, bgcolor: '#ffffff', borderLeft: '5px solid #D5C3B8' }}>
                        <Typography variant="overline" color="textSecondary">Total Providers</Typography>
                        <Typography variant="h4" fontWeight="bold" color="#D5C3B8">{stats.providers}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={2} sx={{ p: 3, bgcolor: '#ffffff', borderLeft: '5px solid #2e7d32' }}>
                        <Typography variant="overline" color="textSecondary">Active Services</Typography>
                        <Typography variant="h4" fontWeight="bold" color="#2e7d32">{stats.services}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom>Provider Verification (Pending)</Typography>
            <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Aadhar</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {providers.filter(p => !p.isVerified).map((p) => (
                            <TableRow key={p._id} hover>
                                <TableCell sx={{ fontWeight: '500' }}>{p.name}</TableCell>
                                <TableCell>{p.phone}</TableCell>
                                <TableCell>
                                    <Link href={`${API_URL}${p.aadharUrl}`} target="_blank" color="primary">View Aadhar</Link>
                                </TableCell>
                                <TableCell align="right">
                                    <Button size="small" variant="contained" color="success" onClick={() => verifyProvider(p._id)}>Verify</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {providers.filter(p => !p.isVerified).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No pending verifications</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Bookings</Typography>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Customer</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Provider</TableCell>
                            <TableCell>Date/Slot</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking._id} hover>
                                <TableCell sx={{ fontWeight: '500' }}>{booking.customer?.name}</TableCell>
                                <TableCell>
                                    <Chip label={booking.service?.name} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>{booking.provider?.name || 'Unassigned'}</TableCell>
                                <TableCell>{booking.date} | {booking.timeSlot}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={booking.status}
                                        size="small"
                                        color={booking.status === 'completed' ? 'success' : 'primary'}
                                        variant={booking.status === 'pending' ? 'outlined' : 'filled'}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

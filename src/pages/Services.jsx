import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Switch, FormControlLabel, IconButton, Grid, Divider,
    Select, MenuItem, InputLabel, FormControl, OutlinedInput, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from 'axios';

import CONFIG from '../constants/Config';

const API_URL = `${CONFIG.API_URL}/services`;

const locationData = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Delhi": ["New Delhi", "Noida", "Gurgaon", "Ghaziabad"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur"]
};

export default function Services() {
    const [services, setServices] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [files, setFiles] = useState([]);

    // Cascading state/city selection
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [currentService, setCurrentService] = useState({
        name: '',
        type: 'standard', // 'standard' or 'pack'
        baseDuration: 60,
        pricing: [{ startTime: '08:00', endTime: '20:00', price: '' }],
        durationPacks: [{ duration: 60, label: '1 hour', price: '', originalPrice: '' }],
        tasks: [{ name: '', duration: '', icon: '' }],
        exclusions: ['']
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axios.get(`${API_URL}?all=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePricingChange = (index, field, value) => {
        const newPricing = [...currentService.pricing];
        newPricing[index][field] = value;
        setCurrentService({ ...currentService, pricing: newPricing });
    };

    const addPricingRow = () => {
        setCurrentService({
            ...currentService,
            pricing: [...currentService.pricing, { startTime: '08:00', endTime: '20:00', price: '' }]
        });
    };

    const removePricingRow = (index) => {
        const newPricing = currentService.pricing.filter((_, i) => i !== index);
        setCurrentService({ ...currentService, pricing: newPricing });
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...currentService.tasks];
        newTasks[index][field] = value;
        setCurrentService({ ...currentService, tasks: newTasks });
    };

    const addTaskRow = () => {
        setCurrentService({
            ...currentService,
            tasks: [...currentService.tasks, { name: '', duration: '' }]
        });
    };

    const removeTaskRow = (index) => {
        const newTasks = currentService.tasks.filter((_, i) => i !== index);
        setCurrentService({ ...currentService, tasks: newTasks });
    };

    const handleExclusionChange = (index, value) => {
        const newExclusions = [...currentService.exclusions];
        newExclusions[index] = value;
        setCurrentService({ ...currentService, exclusions: newExclusions });
    };

    const addExclusionRow = () => {
        setCurrentService({
            ...currentService,
            exclusions: [...currentService.exclusions, '']
        });
    };

    const removeExclusionRow = (index) => {
        const newExclusions = currentService.exclusions.filter((_, i) => i !== index);
        setCurrentService({ ...currentService, exclusions: newExclusions });
    };

    const handlePackChange = (index, field, value) => {
        const newPacks = [...currentService.durationPacks];
        newPacks[index][field] = value;
        setCurrentService({ ...currentService, durationPacks: newPacks });
    };

    const addPackRow = () => {
        setCurrentService({
            ...currentService,
            durationPacks: [...currentService.durationPacks, { duration: 60, label: '', price: '', originalPrice: '' }]
        });
    };

    const removePackRow = (index) => {
        const newPacks = currentService.durationPacks.filter((_, i) => i !== index);
        setCurrentService({ ...currentService, durationPacks: newPacks });
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('name', currentService.name);
        formData.append('type', currentService.type);
        formData.append('baseDuration', currentService.baseDuration);
        formData.append('cities', JSON.stringify([selectedCity]));
        formData.append('pricing', JSON.stringify((currentService.pricing || []).map(p => ({
            ...p,
            price: Number(p.price)
        }))));
        formData.append('durationPacks', JSON.stringify((currentService.durationPacks || []).map(p => ({
            ...p,
            duration: Number(p.duration),
            price: Number(p.price),
            originalPrice: Number(p.originalPrice)
        }))));
        formData.append('tasks', JSON.stringify((currentService.tasks || []).filter(t => t.name)));
        formData.append('exclusions', JSON.stringify((currentService.exclusions || []).filter(e => e && e.trim())));

        files.forEach(file => {
            formData.append('images', file);
        });

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editMode) {
                await axios.patch(`${API_URL}/${currentService._id}`, formData, config);
            } else {
                await axios.post(API_URL, formData, config);
            }
            setOpen(false);
            setFiles([]);
            setSelectedCity('');
            setSelectedState('');
            fetchServices();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response && err.response.data && err.response.data.message 
                ? err.response.data.message 
                : 'Failed to save service';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchServices();
        }
    };

    const toggleStatus = async (service) => {
        await axios.patch(`${API_URL}/${service._id}`, { isEnabled: !service.isEnabled }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchServices();
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Manage Services</Typography>
                <Button variant="contained" onClick={() => {
                    setEditMode(false);
                    setFiles([]);
                    setSelectedState('');
                    setSelectedCity('');
                    setCurrentService({ 
                        name: '', 
                        type: 'standard',
                        baseDuration: 60,
                        pricing: [{ startTime: '08:00', endTime: '20:00', price: '' }],
                        durationPacks: [{ duration: 60, label: '1 hour', price: '', originalPrice: '' }],
                        tasks: [{ name: '', duration: '', icon: '' }],
                        exclusions: ['']
                    });
                    setOpen(true);
                }}>Add New Service</Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Service Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Pricing (Slots)</TableCell>
                            <TableCell>Cities</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow key={service._id} hover>
                                <TableCell sx={{ fontWeight: '500' }}>{service.name}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={service.type === 'pack' ? 'InstaHelp Pack' : 'Standard'} 
                                        size="small" 
                                        color={service.type === 'pack' ? 'secondary' : 'primary'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    {(service.pricing || []).map((p, idx) => (
                                        <Chip
                                            key={p._id || idx}
                                            label={p.startTime ? `${p.startTime}-${p.endTime}: ₹${p.price}` : `${p.timeSlot}: ₹${p.price}`}
                                            size="small"
                                            sx={{ m: 0.5, backgroundColor: '#e3f2fd' }}
                                        />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    {service.cities.map(city => (
                                        <Chip key={city} label={city} size="small" variant="outlined" sx={{ m: 0.2 }} />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={service.isEnabled}
                                        onChange={() => toggleStatus(service)}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => {
                                        setEditMode(true);
                                        setFiles([]);
                                        setSelectedCity(service.cities[0] || '');
                                        // Attempt to set state based on city
                                        const stateFound = Object.keys(locationData).find(s => locationData[s].includes(service.cities[0]));
                                        if (stateFound) setSelectedState(stateFound);
                                        
                                        setCurrentService({ 
                                            ...service,
                                            type: service.type || 'standard',
                                            durationPacks: service.durationPacks && service.durationPacks.length > 0 
                                                ? service.durationPacks 
                                                : [{ duration: 60, label: '', price: '', originalPrice: '' }],
                                            tasks: service.tasks && service.tasks.length > 0 ? service.tasks : [{ name: '', duration: '', icon: '' }],
                                            exclusions: service.exclusions && service.exclusions.length > 0 ? service.exclusions : ['']
                                        });
                                        setOpen(true);
                                    }}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(service._id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{editMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Service Type</InputLabel>
                                <Select
                                    value={currentService.type}
                                    label="Service Type"
                                    onChange={e => setCurrentService({ ...currentService, type: e.target.value })}
                                >
                                    <MenuItem value="standard">Standard Service</MenuItem>
                                    <MenuItem value="pack">InstaHelp Pack</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Service Name" variant="outlined" value={currentService.name} onChange={e => setCurrentService({ ...currentService, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Base Duration (mins)" variant="outlined" type="number" value={currentService.baseDuration} onChange={e => setCurrentService({ ...currentService, baseDuration: Number(e.target.value) })} />
                        </Grid>

                        {currentService.type === 'pack' && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Duration Packs (Tiered Pricing)</Typography>
                                {currentService.durationPacks.map((p, index) => (
                                    <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                                        <Grid item xs={2}>
                                            <TextField fullWidth size="small" label="Duration (mins)" type="number" value={p.duration} onChange={e => handlePackChange(index, 'duration', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField fullWidth size="small" label="Display Label" value={p.label} onChange={e => handlePackChange(index, 'label', e.target.value)} placeholder="e.g. 1 hour" />
                                        </Grid>
                                        <Grid item xs={2.5}>
                                            <TextField fullWidth size="small" label="Price (₹)" type="number" value={p.price} onChange={e => handlePackChange(index, 'price', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={2.5}>
                                            <TextField fullWidth size="small" label="Original Price (₹)" type="number" value={p.originalPrice} onChange={e => handlePackChange(index, 'originalPrice', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton color="error" onClick={() => removePackRow(index)} disabled={currentService.durationPacks.length === 1}>
                                                <RemoveCircleIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button startIcon={<AddCircleIcon />} variant="outlined" size="small" onClick={addPackRow}>
                                    Add Duration Tier
                                </Button>
                                <Divider sx={{ mt: 3 }} />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Service Areas</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select State</InputLabel>
                                        <Select
                                            value={selectedState}
                                            label="Select State"
                                            onChange={(e) => {
                                                setSelectedState(e.target.value);
                                                setSelectedCity('');
                                            }}
                                        >
                                            {Object.keys(locationData).map(state => (
                                                <MenuItem key={state} value={state}>{state}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth disabled={!selectedState}>
                                        <InputLabel>Select City</InputLabel>
                                        <Select
                                            value={selectedCity}
                                            label="Select City"
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                        >
                                            {selectedState && locationData[selectedState].map((city) => (
                                                <MenuItem key={city} value={city}>{city}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Pricing & Operating Windows</Typography>
                            {currentService.pricing.map((p, index) => (
                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                                    <Grid item xs={3.5}>
                                        <TextField fullWidth size="small" label="Start Time" value={p.startTime} onChange={e => handlePricingChange(index, 'startTime', e.target.value)} placeholder="08:00" />
                                    </Grid>
                                    <Grid item xs={3.5}>
                                        <TextField fullWidth size="small" label="End Time" value={p.endTime} onChange={e => handlePricingChange(index, 'endTime', e.target.value)} placeholder="20:00" />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField fullWidth size="small" label="Price (₹)" type="number" value={p.price} onChange={e => handlePricingChange(index, 'price', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <IconButton color="error" onClick={() => removePricingRow(index)} disabled={currentService.pricing.length === 1}>
                                            <RemoveCircleIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircleIcon />} variant="outlined" size="small" onClick={addPricingRow}>
                                Add More Windows
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Tasks (How long does it take?)</Typography>
                            {currentService.tasks.map((t, index) => (
                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                                    <Grid item xs={5}>
                                        <TextField fullWidth size="small" label="Task Name (e.g. Mopping)" value={t.name} onChange={e => handleTaskChange(index, 'name', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <TextField fullWidth size="small" label="Duration (e.g. 30 mins)" value={t.duration} onChange={e => handleTaskChange(index, 'duration', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <IconButton color="error" onClick={() => removeTaskRow(index)} disabled={currentService.tasks.length === 1}>
                                            <RemoveCircleIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addTaskRow}>Add Task</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Exclusions (What's excluded)</Typography>
                            {currentService.exclusions.map((ex, index) => (
                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
                                    <Grid item xs={10}>
                                        <TextField fullWidth size="small" label="Exclusion" value={ex} onChange={e => handleExclusionChange(index, e.target.value)} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <IconButton color="error" onClick={() => removeExclusionRow(index)} disabled={currentService.exclusions.length === 1}>
                                            <RemoveCircleIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addExclusionRow}>Add Exclusion</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Images</Typography>
                            
                            {/* Existing Images */}
                            {editMode && currentService.images && currentService.images.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {currentService.images.map((img, idx) => (
                                        <Box key={idx} sx={{ position: 'relative' }}>
                                            <img 
                                                src={img.startsWith('http') ? img : `${CONFIG.API_URL}${img}`} 
                                                alt="service" 
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }} 
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderStyle: 'dashed' }}>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFiles(Array.from(e.target.files))}
                                    id="service-image-upload"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="service-image-upload">
                                    <Button variant="outlined" component="span" startIcon={<AddIcon />}>
                                        {editMode ? 'Add More Images' : 'Choose Images'}
                                    </Button>
                                </label>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    {files.length > 0 ? `${files.length} new images selected` : 'Max 10 images supported'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" disabled={!selectedCity || !currentService.name} onClick={handleSave} color="primary">
                        {editMode ? 'Update Service' : 'Create Service'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

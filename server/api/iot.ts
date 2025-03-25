import { Express } from 'express';
import * as IoT from '../iot';

export function setupIoTAPI(app: Express) {
  // Initialize IoT system with demo devices and assets
  IoT.initializeIoT();
  
  // Get all IoT devices
  app.get('/api/iot/devices', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const devices = IoT.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error('Error getting devices:', error);
      res.status(500).json({ message: 'Failed to get devices' });
    }
  });
  
  // Get a specific device
  app.get('/api/iot/devices/:deviceId', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { deviceId } = req.params;
      const device = IoT.getDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      res.json(device);
    } catch (error) {
      console.error('Error getting device:', error);
      res.status(500).json({ message: 'Failed to get device' });
    }
  });
  
  // Register a new device
  app.post('/api/iot/devices', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { name, type, location, metadata } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Device name is required' });
      }
      
      if (!type) {
        return res.status(400).json({ message: 'Device type is required' });
      }
      
      if (!location) {
        return res.status(400).json({ message: 'Device location is required' });
      }
      
      const deviceId = IoT.registerDevice(name, type, location, metadata || {});
      const device = IoT.getDevice(deviceId);
      
      res.status(201).json(device);
    } catch (error) {
      console.error('Error registering device:', error);
      res.status(500).json({ message: 'Failed to register device' });
    }
  });
  
  // Get sensor readings for a device
  app.get('/api/iot/devices/:deviceId/readings', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { deviceId } = req.params;
      const readings = IoT.getDeviceReadings(deviceId);
      
      res.json(readings);
    } catch (error) {
      console.error('Error getting readings:', error);
      res.status(500).json({ message: 'Failed to get readings' });
    }
  });
  
  // Add a sensor reading
  app.post('/api/iot/devices/:deviceId/readings', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { deviceId } = req.params;
      const { type, value, unit } = req.body;
      
      if (!type) {
        return res.status(400).json({ message: 'Reading type is required' });
      }
      
      if (value === undefined || value === null) {
        return res.status(400).json({ message: 'Reading value is required' });
      }
      
      if (!unit) {
        return res.status(400).json({ message: 'Reading unit is required' });
      }
      
      const reading = IoT.recordSensorReading(deviceId, type, value, unit);
      
      res.status(201).json(reading);
    } catch (error) {
      console.error('Error recording reading:', error);
      res.status(500).json({ message: 'Failed to record reading' });
    }
  });
  
  // Set device status (online, offline, maintenance)
  app.put('/api/iot/devices/:deviceId/status', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { deviceId } = req.params;
      const { status } = req.body;
      
      if (!status || !['online', 'offline', 'maintenance'].includes(status)) {
        return res.status(400).json({ message: 'Valid status is required (online, offline, maintenance)' });
      }
      
      const updatedDevice = IoT.setDeviceStatus(deviceId, status);
      
      res.json(updatedDevice);
    } catch (error) {
      console.error('Error updating device status:', error);
      res.status(500).json({ message: 'Failed to update device status' });
    }
  });
  
  // Get all assets
  app.get('/api/iot/assets', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const assets = IoT.getAllAssets();
      res.json(assets);
    } catch (error) {
      console.error('Error getting assets:', error);
      res.status(500).json({ message: 'Failed to get assets' });
    }
  });
  
  // Get a specific asset
  app.get('/api/iot/assets/:assetId', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { assetId } = req.params;
      const asset = IoT.getAsset(assetId);
      
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      res.json(asset);
    } catch (error) {
      console.error('Error getting asset:', error);
      res.status(500).json({ message: 'Failed to get asset' });
    }
  });
  
  // Register a new asset
  app.post('/api/iot/assets', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { assetId, assetName, assetType, location, status, metadata } = req.body;
      
      if (!assetId) {
        return res.status(400).json({ message: 'Asset ID is required' });
      }
      
      if (!assetName) {
        return res.status(400).json({ message: 'Asset name is required' });
      }
      
      if (!assetType) {
        return res.status(400).json({ message: 'Asset type is required' });
      }
      
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({ message: 'Asset location with latitude and longitude is required' });
      }
      
      const asset = IoT.registerAsset(
        assetId,
        assetName,
        assetType,
        location,
        status || 'available',
        metadata || {}
      );
      
      res.status(201).json(asset);
    } catch (error) {
      console.error('Error registering asset:', error);
      res.status(500).json({ message: 'Failed to register asset' });
    }
  });
  
  // Update asset location
  app.put('/api/iot/assets/:assetId/location', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { assetId } = req.params;
      const { latitude, longitude, locationName, status, temperature, humidity, batteryLevel } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      const updatedAsset = IoT.updateAssetLocation(
        assetId,
        latitude,
        longitude,
        locationName,
        status,
        temperature,
        humidity,
        batteryLevel
      );
      
      res.json(updatedAsset);
    } catch (error) {
      console.error('Error updating asset location:', error);
      res.status(500).json({ message: 'Failed to update asset location' });
    }
  });
  
  // Get assets by status
  app.get('/api/iot/assets/status/:status', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { status } = req.params;
      
      if (!['available', 'in-use', 'maintenance', 'lost'].includes(status)) {
        return res.status(400).json({ message: 'Valid status is required (available, in-use, maintenance, lost)' });
      }
      
      const assets = IoT.getAssetsByStatus(status as any);
      
      res.json(assets);
    } catch (error) {
      console.error('Error getting assets by status:', error);
      res.status(500).json({ message: 'Failed to get assets by status' });
    }
  });
  
  // Get assets by type
  app.get('/api/iot/assets/type/:type', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { type } = req.params;
      const assets = IoT.getAssetsByType(type);
      
      res.json(assets);
    } catch (error) {
      console.error('Error getting assets by type:', error);
      res.status(500).json({ message: 'Failed to get assets by type' });
    }
  });
  
  // Detect anomalies for a device
  app.post('/api/iot/devices/:deviceId/detect-anomalies', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { deviceId } = req.params;
      const { thresholds } = req.body;
      
      if (!thresholds || typeof thresholds !== 'object') {
        return res.status(400).json({ message: 'Valid thresholds object is required' });
      }
      
      const anomalies = IoT.detectAnomalies(deviceId, thresholds);
      
      res.json({
        deviceId,
        anomaliesDetected: anomalies.length,
        anomalies
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      res.status(500).json({ message: 'Failed to detect anomalies' });
    }
  });
}
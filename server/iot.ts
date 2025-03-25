import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';

// In a real IoT implementation, this would interface with actual IoT devices
// via MQTT, WebSockets, or another protocol

// Types for IoT device and sensor data
interface IoTDevice {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: Date;
  metadata: Record<string, any>;
}

interface SensorReading {
  deviceId: string;
  timestamp: Date;
  type: string;
  value: number;
  unit: string;
}

interface AssetTrackingData {
  assetId: string;
  assetName: string;
  assetType: string;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    locationName?: string;
  };
  status: 'available' | 'in-use' | 'maintenance' | 'lost';
  temperature?: number;
  humidity?: number;
  batteryLevel?: number;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

// In-memory storage for IoT data (in a real app, this would be in a database)
const devices = new Map<string, IoTDevice>();
const sensorReadings = new Map<string, SensorReading[]>();
const assets = new Map<string, AssetTrackingData>();

// Initialize with some demo devices and assets
export function initializeIoT() {
  // Add some virtual IoT devices
  const deviceIds = [
    registerDevice('Warehouse Sensor Hub', 'environmental', 'Warehouse A', { capabilities: ['temperature', 'humidity', 'motion'] }),
    registerDevice('Office Environment Monitor', 'environmental', 'Main Office', { capabilities: ['temperature', 'humidity', 'air-quality'] }),
    registerDevice('Vehicle Tracker 1', 'gps', 'Delivery Van #1', { vehicleId: 'VAN-001' }),
    registerDevice('Equipment Monitor', 'asset-tracker', 'Factory Floor', { capabilities: ['vibration', 'temperature', 'usage-hours'] })
  ];
  
  // Add some virtual assets being tracked
  registerAsset('AST-001', 'Forklift #1', 'heavy-equipment', {
    latitude: 34.0522,
    longitude: -118.2437,
    locationName: 'Warehouse A, Zone 3'
  }, 'available', { purchaseDate: '2023-01-15', maintenanceDue: '2023-07-15' });
  
  registerAsset('AST-002', 'Pallet Jack #3', 'equipment', {
    latitude: 34.0523,
    longitude: -118.2436,
    locationName: 'Warehouse A, Zone 2'
  }, 'in-use', { lastMaintenanceDate: '2023-02-20' });
  
  registerAsset('AST-003', 'Delivery Van', 'vehicle', {
    latitude: 34.0800,
    longitude: -118.2995,
    locationName: 'In transit - Hollywood'
  }, 'in-use', { licensePlate: 'XYZ-1234', nextService: '2023-08-10' });
  
  registerAsset('AST-004', 'AirCompressor #2', 'equipment', {
    latitude: 34.0521,
    longitude: -118.2438,
    locationName: 'Warehouse B, Zone 1'
  }, 'maintenance', { issue: 'Pressure valve replacement' });
  
  // Generate some random sensor data
  generateRandomSensorData(deviceIds[0], 'temperature', 20, 25, '°C');
  generateRandomSensorData(deviceIds[0], 'humidity', 40, 60, '%');
  generateRandomSensorData(deviceIds[1], 'temperature', 21, 23, '°C');
  generateRandomSensorData(deviceIds[1], 'air-quality', 85, 95, 'AQI');
  
  console.log('IoT system initialized with demo devices and assets');
  
  return {
    deviceCount: devices.size,
    assetCount: assets.size,
    readingCount: Array.from(sensorReadings.values()).reduce((sum, readings) => sum + readings.length, 0)
  };
}

// Register a new IoT device
export function registerDevice(
  name: string,
  type: string,
  location: string,
  metadata: Record<string, any> = {}
): string {
  const id = uuidv4();
  const device: IoTDevice = {
    id,
    name,
    type,
    location,
    status: 'online',
    lastSeen: new Date(),
    metadata
  };
  
  devices.set(id, device);
  return id;
}

// Register a new asset for tracking
export function registerAsset(
  assetId: string,
  assetName: string,
  assetType: string,
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    locationName?: string;
  },
  status: 'available' | 'in-use' | 'maintenance' | 'lost' = 'available',
  metadata: Record<string, any> = {}
): AssetTrackingData {
  const asset: AssetTrackingData = {
    assetId,
    assetName,
    assetType,
    location,
    status,
    lastUpdated: new Date(),
    metadata
  };
  
  assets.set(assetId, asset);
  return asset;
}

// Record a sensor reading
export function recordSensorReading(
  deviceId: string,
  type: string,
  value: number,
  unit: string
): SensorReading {
  const device = devices.get(deviceId);
  
  if (!device) {
    throw new Error(`Device with ID ${deviceId} not found`);
  }
  
  const reading: SensorReading = {
    deviceId,
    timestamp: new Date(),
    type,
    value,
    unit
  };
  
  // Update the device's last seen timestamp
  device.lastSeen = new Date();
  devices.set(deviceId, device);
  
  // Add the reading to the device's readings
  const deviceReadings = sensorReadings.get(deviceId) || [];
  deviceReadings.push(reading);
  sensorReadings.set(deviceId, deviceReadings);
  
  return reading;
}

// Update an asset's location and status
export function updateAssetLocation(
  assetId: string,
  latitude: number,
  longitude: number,
  locationName?: string,
  status?: 'available' | 'in-use' | 'maintenance' | 'lost',
  temperature?: number,
  humidity?: number,
  batteryLevel?: number
): AssetTrackingData {
  const asset = assets.get(assetId);
  
  if (!asset) {
    throw new Error(`Asset with ID ${assetId} not found`);
  }
  
  // Update the asset data
  asset.location.latitude = latitude;
  asset.location.longitude = longitude;
  
  if (locationName) {
    asset.location.locationName = locationName;
  }
  
  if (status) {
    asset.status = status;
  }
  
  if (temperature !== undefined) {
    asset.temperature = temperature;
  }
  
  if (humidity !== undefined) {
    asset.humidity = humidity;
  }
  
  if (batteryLevel !== undefined) {
    asset.batteryLevel = batteryLevel;
  }
  
  asset.lastUpdated = new Date();
  
  // Save the updated asset
  assets.set(assetId, asset);
  
  // Create a notification about asset movement
  try {
    storage.createNotification({
      userId: 1, // This would normally be the appropriate user or all relevant users
      message: `Asset ${asset.assetName} has moved to ${locationName || 'a new location'}`,
      type: 'info',
      read: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
  
  return asset;
}

// Get a list of all devices
export function getAllDevices(): IoTDevice[] {
  return Array.from(devices.values());
}

// Get a specific device by ID
export function getDevice(deviceId: string): IoTDevice | undefined {
  return devices.get(deviceId);
}

// Get all sensor readings for a device
export function getDeviceReadings(deviceId: string): SensorReading[] {
  return sensorReadings.get(deviceId) || [];
}

// Get a list of all assets
export function getAllAssets(): AssetTrackingData[] {
  return Array.from(assets.values());
}

// Get a specific asset by ID
export function getAsset(assetId: string): AssetTrackingData | undefined {
  return assets.get(assetId);
}

// Get assets by status
export function getAssetsByStatus(status: 'available' | 'in-use' | 'maintenance' | 'lost'): AssetTrackingData[] {
  return Array.from(assets.values()).filter(asset => asset.status === status);
}

// Get assets by type
export function getAssetsByType(assetType: string): AssetTrackingData[] {
  return Array.from(assets.values()).filter(asset => asset.assetType === assetType);
}

// Simulate device going offline
export function setDeviceStatus(deviceId: string, status: 'online' | 'offline' | 'maintenance'): IoTDevice {
  const device = devices.get(deviceId);
  
  if (!device) {
    throw new Error(`Device with ID ${deviceId} not found`);
  }
  
  device.status = status;
  device.lastSeen = new Date();
  devices.set(deviceId, device);
  
  // Create notification about device status change
  try {
    storage.createNotification({
      userId: 1, // This would normally be the appropriate user or all relevant users
      message: `Device ${device.name} is now ${status}`,
      type: status === 'online' ? 'info' : 'warning',
      read: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
  
  return device;
}

// Simulate an anomaly detection - this would normally be done by an ML algorithm
export function detectAnomalies(deviceId: string, thresholds: Record<string, { min: number; max: number }>): any[] {
  const readings = sensorReadings.get(deviceId) || [];
  const device = devices.get(deviceId);
  
  if (!device) {
    throw new Error(`Device with ID ${deviceId} not found`);
  }
  
  const anomalies = [];
  
  // Group readings by type
  const readingsByType: Record<string, SensorReading[]> = {};
  
  for (const reading of readings) {
    if (!readingsByType[reading.type]) {
      readingsByType[reading.type] = [];
    }
    readingsByType[reading.type].push(reading);
  }
  
  // Check for readings outside thresholds
  for (const [type, typeReadings] of Object.entries(readingsByType)) {
    const threshold = thresholds[type];
    
    if (threshold) {
      const recentReadings = typeReadings
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
      
      for (const reading of recentReadings) {
        if (reading.value < threshold.min || reading.value > threshold.max) {
          anomalies.push({
            deviceId,
            deviceName: device.name,
            readingType: type,
            value: reading.value,
            timestamp: reading.timestamp,
            threshold,
            message: `Anomaly detected: ${type} value ${reading.value} is outside threshold (${threshold.min} - ${threshold.max})`
          });
        }
      }
    }
  }
  
  // If anomalies were found, create notifications
  if (anomalies.length > 0) {
    try {
      for (const anomaly of anomalies) {
        storage.createNotification({
          userId: 1, // This would normally be the appropriate user or all relevant users
          message: anomaly.message,
          type: 'error',
          read: false
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
  
  return anomalies;
}

// Utility function to generate random sensor data for demo purposes
function generateRandomSensorData(
  deviceId: string,
  type: string,
  min: number,
  max: number,
  unit: string,
  count = 20
) {
  const readings: SensorReading[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const randomValue = min + Math.random() * (max - min);
    const timestamp = new Date(now.getTime() - (count - i) * 15 * 60 * 1000); // 15 minutes apart
    
    readings.push({
      deviceId,
      timestamp,
      type,
      value: parseFloat(randomValue.toFixed(2)),
      unit
    });
  }
  
  sensorReadings.set(deviceId, [...(sensorReadings.get(deviceId) || []), ...readings]);
}
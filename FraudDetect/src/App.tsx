import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PredictionResponse {
  fraud: boolean;
  prediction_label: string;
  probability_fraud: number;
  probability_not_fraud: number;
  error?: string;
}

interface FormData {
  Vehicle_Type: string;
  Lane_Type: string;
  Vehicle_Dimensions: string;
  Transaction_Amount: number;
  Amount_paid: number;
  Vehicle_Speed: number;
  state_code: string;
  Hour: number;
  DayOfWeek: number;
  Month: number;
}

const INITIAL_FORM_DATA: FormData = {
  Vehicle_Type: 'Car',
  Lane_Type: 'Express',
  Vehicle_Dimensions: 'Small',
  Transaction_Amount: 0,
  Amount_paid: 0,
  Vehicle_Speed: 0,
  state_code: 'KA',
  Hour: 0,
  DayOfWeek: 0,
  Month: 1,
};

// Complete vehicle type options according to backend mappings
const VEHICLE_TYPES = ['Bus', 'Car', 'Motorcycle', 'SUV', 'Sedan', 'Truck', 'Van'];
const LANE_TYPES = ['Express', 'Regular'];
const VEHICLE_DIMENSIONS = ['Large', 'Medium', 'Small'];
const STATE_CODES = ['AP', 'BR', 'DL', 'GA', 'GJ', 'HR', 'KA', 'KL', 'MH', 'MP', 'RJ', 'TN', 'TS', 'UP', 'WB'];

// API endpoint configuration with fallback options
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['Transaction_Amount', 'Amount_paid', 'Vehicle_Speed', 'Hour', 'DayOfWeek', 'Month'].includes(name)
      ? value === '' ? '' : parseFloat(value) || 0
      : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);
    setIsLoading(true);

    // Basic validation
    if (formData.Transaction_Amount < 0 || formData.Amount_paid < 0 || formData.Vehicle_Speed < 0) {
      setError("Numeric values cannot be negative.");
      setIsLoading(false);
      return;
    }

    try {
      // First check if the API is available
      const healthCheck = await fetch(`${API_URL}/health`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);
      
      if (!healthCheck || !healthCheck.ok) {
        throw new Error('API server is not available. Please ensure the backend is running.');
      }
      
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
           Fraud Detection System
        </h1>

        {/* API Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-center">
            Connecting to API at: <code className="bg-gray-100 px-2 py-1 rounded">{API_URL}</code>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorical Inputs */}
              <div>
                <label className="block font-bold mb-2">Vehicle Type</label>
                <select
                  name="Vehicle_Type"
                  value={formData.Vehicle_Type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Lane Type</label>
                <select
                  name="Lane_Type"
                  value={formData.Lane_Type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Vehicle Dimensions</label>
                <select
                  name="Vehicle_Dimensions"
                  value={formData.Vehicle_Dimensions}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VEHICLE_DIMENSIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">State Code</label>
                <select
                  name="state_code"
                  value={formData.state_code}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATE_CODES.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              {/* Numeric Inputs */}
              <div>
                <label className="block font-bold mb-2">Transaction Amount (₹)</label>
                <input
                  type="number"
                  name="Transaction_Amount"
                  value={formData.Transaction_Amount}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Amount Paid (₹)</label>
                <input
                  type="number"
                  name="Amount_paid"
                  value={formData.Amount_paid}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Vehicle Speed (km/h)</label>
                <input
                  type="number"
                  name="Vehicle_Speed"
                  value={formData.Vehicle_Speed}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Hour (0-23)</label>
                <select
                  name="Hour"
                  value={formData.Hour}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Day of Week</label>
                <select
                  name="DayOfWeek"
                  value={formData.DayOfWeek}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    { value: 0, label: 'Monday' },
                    { value: 1, label: 'Tuesday' },
                    { value: 2, label: 'Wednesday' },
                    { value: 3, label: 'Thursday' },
                    { value: 4, label: 'Friday' },
                    { value: 5, label: 'Saturday' },
                    { value: 6, label: 'Sunday' },
                  ].map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Month</label>
                <select
                  name="Month"
                  value={formData.Month}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Predicting...' : 'Predict Fraud'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {(prediction || error) && (
          <div className={`p-6 rounded-lg shadow-md ${
            error ? 'bg-yellow-50 border border-yellow-200' :
            prediction?.fraud ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            {error ? (
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle size={24} />
                <p className="font-bold">Error: {error}</p>
              </div>
            ) : prediction && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {prediction.fraud ? (
                    <>
                      <XCircle className="text-red-600" size={24} />
                      <p className="font-bold text-red-600">Prediction: {prediction.prediction_label || 'Fraud Detected'}</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="text-green-600" size={24} />
                      <p className="font-bold text-green-600">Prediction: {prediction.prediction_label || 'No Fraud'}</p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <p>Probability of Fraud: {(prediction.probability_fraud * 100).toFixed(2)}%</p>
                  <p>Probability of No Fraud: {(prediction.probability_not_fraud * 100).toFixed(2)}%</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
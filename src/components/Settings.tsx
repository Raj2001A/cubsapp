import React from 'react';
import { Save, Bell, Lock, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { visaReminder, setVisaReminder } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg border border-[#DD1A51]">
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <img src="/companylogo.png" alt="CUBS Group of Companies Logo" className="h-10" />
            <h3 className="text-xl font-bold text-black flex items-center gap-2">
              <span className="inline-block bg-[#DD1A51] text-white rounded-full p-2"><Globe size={18} /></span>
              Company Information
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-black">Company Name</label>
              <input type="text" name="company-name" id="company-name" defaultValue="Cubs Technical" className="mt-1 block w-full rounded-md border border-[#DD1A51] focus:border-[#b3123e] focus:ring-2 focus:ring-[#DD1A51] text-black placeholder-[#b3123e] bg-white px-4 py-2" />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-black">Website</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[#DD1A51] bg-[#ffe5ed] text-[#b3123e]">https://</span>
                <input type="text" name="website" id="website" defaultValue="cubstechnical.ae" className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-[#DD1A51] focus:border-[#b3123e] focus:ring-2 focus:ring-[#DD1A51] text-black placeholder-[#b3123e] bg-white" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-black">Address</label>
              <input type="text" name="address" id="address" defaultValue="Near Rolla park - Al Ghuwair St - Al Ghuwair - Al Gharb - Sharjah - United Arab Emirates" className="mt-1 block w-full rounded-md border border-[#DD1A51] focus:border-[#b3123e] focus:ring-2 focus:ring-[#DD1A51] text-black placeholder-[#b3123e] bg-white px-4 py-2" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-black">Phone</label>
              <input type="text" name="phone" id="phone" defaultValue="+971 6 562 9143" className="mt-1 block w-full rounded-md border border-[#DD1A51] focus:border-[#b3123e] focus:ring-2 focus:ring-[#DD1A51] text-black placeholder-[#b3123e] bg-white px-4 py-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#DD1A51]">
        <div className="px-6 py-5">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span className="inline-block bg-[#DD1A51] text-white rounded-full p-2"><Bell size={18} /></span>
            Notification Settings
          </h3>
          <div className="flex items-center gap-4">
            <input id="email-notifications" name="email-notifications" type="checkbox" defaultChecked className="h-5 w-5 text-[#DD1A51] focus:ring-[#DD1A51] border-[#DD1A51] rounded" />
            <label htmlFor="email-notifications" className="text-black font-medium">Email notifications for visa expiry</label>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#DD1A51]">
        <div className="px-6 py-5">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span className="inline-block bg-[#DD1A51] text-white rounded-full p-2"><Lock size={18} /></span>
            Security
          </h3>
          <button type="button" className="inline-flex items-center px-4 py-2 border border-[#DD1A51] rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-[#ffe5ed] focus:outline-none focus:ring-2 focus:ring-[#DD1A51]">
            Change Password
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#DD1A51]">
        <div className="px-6 py-5">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <span className="inline-block bg-[#DD1A51] text-white rounded-full p-2"><Globe size={18} /></span>
            System Preferences
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-black">Language</label>
              <select id="language" name="language" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#DD1A51] focus:outline-none focus:ring-2 focus:ring-[#DD1A51] rounded-md text-black bg-white">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label htmlFor="date-format" className="block text-sm font-medium text-black">Date Format</label>
              <select id="date-format" name="date-format" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#DD1A51] focus:outline-none focus:ring-2 focus:ring-[#DD1A51] rounded-md text-black bg-white">
                <option value="mdy">MM/DD/YYYY</option>
                <option value="dmy">DD/MM/YYYY</option>
                <option value="ymd">YYYY/MM/DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#DD1A51]">
        <div className="px-6 py-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Bell size={18} /> Visa Reminder
          </h3>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="toggleVisaReminder" className="sr-only" checked={visaReminder} onChange={() => setVisaReminder(!visaReminder)} />
              <div className="block bg-[#ffe5ed] w-14 h-8 rounded-full border border-[#DD1A51]"></div>
              <div className={`dot absolute left-1 top-1 bg-[#DD1A51] w-6 h-6 rounded-full transition ${visaReminder ? 'translate-x-full' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="inline-flex items-center px-4 py-2 border border-[#DD1A51] shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-[#ffe5ed] focus:outline-none focus:ring-2 focus:ring-[#DD1A51]">Cancel</button>
        <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#DD1A51] hover:bg-[#b3123e] focus:outline-none focus:ring-2 focus:ring-[#DD1A51]">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;

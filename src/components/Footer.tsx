import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-tight">CamLand Registry</span>
                <span className="text-xs text-gray-500">Republic of Cameroon</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Official digital platform for land registration, ownership verification, and secure land marketplace in Cameroon.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://wa.me/237650850854" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li><Link to="/marketplace" className="text-sm hover:text-white transition-colors">Land Marketplace</Link></li>
              <li><Link to="/verify" className="text-sm hover:text-white transition-colors">Verify Ownership</Link></li>
              <li><Link to="/register-land" className="text-sm hover:text-white transition-colors">Register Land</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">About CamLand</Link></li>
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-white font-semibold mb-4">Covered Regions</h3>
            <ul className="space-y-2.5">
              <li className="text-sm flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-400" /> Centre (Yaoundé)</li>
              <li className="text-sm flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-400" /> Littoral (Douala)</li>
              <li className="text-sm flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-400" /> West (Bafoussam)</li>
              <li className="text-sm flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-400" /> South-West (Buea)</li>
              <li className="text-sm flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-400" /> All 10 Regions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                Ministry of State Property, Yaoundé, Cameroon
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                +237 650850854
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                info@camland-registry.cm
              </li>
            </ul>
            <div className="mt-5 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">Office Hours</p>
              <p className="text-sm text-white font-medium">Mon - Fri: 8:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CamLand Digital Registry. Republic of Cameroon. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-300 cursor-pointer">Legal Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

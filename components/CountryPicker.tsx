"use client";

import { getCountryList } from "@/lib/fleets";
import { useState } from "react";

interface CountryPickerProps {
  selectedCountry: string;
  onSelect: (countryCode: string) => void;
}

export default function CountryPicker({ selectedCountry, onSelect }: CountryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const countries = getCountryList();
  const selected = countries.find(c => c.code === selectedCountry) || countries[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-all"
      >
        <span className="text-2xl">{selected.flag}</span>
        <span className="font-semibold">{selected.name}</span>
        <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-slate-800 rounded-lg border border-slate-600 shadow-xl z-50 max-h-96 overflow-y-auto">
          {countries.map(country => (
            <button
              key={country.code}
              onClick={() => {
                onSelect(country.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-all text-left ${
                country.code === selectedCountry ? "bg-slate-700" : ""
              }`}
            >
              <span className="text-2xl">{country.flag}</span>
              <span className="font-semibold">{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { Vessel, ShipKind } from "./types";

export type FleetPack = Record<string, Vessel[]>;

export const SHIP_SIZES: Record<ShipKind, number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

export const Fleets: FleetPack = {
  USA: [
    { name: "USS Gerald R. Ford (CVN-78)", class: "Ford-class", kind: "carrier", length: 5 },
    { name: "USS Arleigh Burke (DDG-51)", class: "Arleigh Burke-class", kind: "battleship", length: 4 },
    { name: "USS Ticonderoga (CG-47)", class: "Ticonderoga-class", kind: "cruiser", length: 3 },
    { name: "USS Virginia (SSN-774)", class: "Virginia-class", kind: "submarine", length: 3 },
    { name: "USS Freedom (LCS-1)", class: "Freedom-class", kind: "destroyer", length: 2 },
  ],
  UK: [
    { name: "HMS Queen Elizabeth (R08)", class: "Queen Elizabeth-class", kind: "carrier", length: 5 },
    { name: "HMS Daring (D32)", class: "Type 45", kind: "battleship", length: 4 },
    { name: "HMS Montrose (F236)", class: "Type 23", kind: "cruiser", length: 3 },
    { name: "HMS Astute (S119)", class: "Astute-class", kind: "submarine", length: 3 },
    { name: "HMS Tamar (P233)", class: "River-class", kind: "destroyer", length: 2 },
  ],
  France: [
    { name: "FS Charles de Gaulle (R91)", class: "Nuclear carrier", kind: "carrier", length: 5 },
    { name: "FS Chevalier Paul (D621)", class: "Horizon-class", kind: "battleship", length: 4 },
    { name: "FS Forbin (D620)", class: "Horizon-class", kind: "cruiser", length: 3 },
    { name: "FS Suffren (Q284)", class: "Barracuda-class", kind: "submarine", length: 3 },
    { name: "FS L'Adroit (P725)", class: "Gowind", kind: "destroyer", length: 2 },
  ],
  Japan: [
    { name: "JS Izumo (DDH-183)", class: "Izumo-class", kind: "carrier", length: 5 },
    { name: "JS Maya (DDG-179)", class: "Maya-class", kind: "battleship", length: 4 },
    { name: "JS Akizuki (DD-115)", class: "Akizuki-class", kind: "cruiser", length: 3 },
    { name: "JS Soryu (SS-501)", class: "Soryu-class", kind: "submarine", length: 3 },
    { name: "JS Kumano (FFM-2)", class: "Mogami-class", kind: "destroyer", length: 2 },
  ],
  India: [
    { name: "INS Vikrant (R11)", class: "Indigenous carrier", kind: "carrier", length: 5 },
    { name: "INS Kolkata (D63)", class: "Kolkata-class", kind: "battleship", length: 4 },
    { name: "INS Shivalik (F47)", class: "Shivalik-class", kind: "cruiser", length: 3 },
    { name: "INS Arihant (S2)", class: "Arihant-class SSBN", kind: "submarine", length: 3 },
    { name: "INS Kamorta (P28)", class: "ASW Corvette", kind: "destroyer", length: 2 },
  ],
  China: [
    { name: "CNS Shandong (17)", class: "Type 002", kind: "carrier", length: 5 },
    { name: "CNS Nanchang (101)", class: "Type 055", kind: "battleship", length: 4 },
    { name: "CNS Xi'an (153)", class: "Type 052C/D", kind: "cruiser", length: 3 },
    { name: "Type 093 SSN", class: "Shang-class", kind: "submarine", length: 3 },
    { name: "Type 056A Corvette", class: "Jiangdao-class", kind: "destroyer", length: 2 },
  ],
  Russia: [
    { name: "Admiral Kuznetsov", class: "Aircraft carrier", kind: "carrier", length: 5 },
    { name: "Admiral Gorshkov (454)", class: "Frigate", kind: "battleship", length: 4 },
    { name: "Marshal Ustinov (055)", class: "Slava-class cruiser", kind: "cruiser", length: 3 },
    { name: "Yasen-class SSN (K-560 Severodvinsk)", class: "Yasen", kind: "submarine", length: 3 },
    { name: "Buyan-M Corvette", class: "Project 21631", kind: "destroyer", length: 2 },
  ],
  SouthKorea: [
    { name: "ROKS Dokdo (LPH-6111)", class: "LPH", kind: "carrier", length: 5 },
    { name: "ROKS Sejong the Great (DDG-991)", class: "KDX-III", kind: "battleship", length: 4 },
    { name: "ROKS Daegu (FFG-818)", class: "Daegu-class", kind: "cruiser", length: 3 },
    { name: "ROKS Dosan Ahn Chang-ho (SS-083)", class: "KSS-III", kind: "submarine", length: 3 },
    { name: "PKG-A Patrol", class: "Patrol Killer", kind: "destroyer", length: 2 },
  ],
  Italy: [
    { name: "ITS Cavour (550)", class: "Carrier", kind: "carrier", length: 5 },
    { name: "ITS Andrea Doria (D553)", class: "Horizon-class", kind: "battleship", length: 4 },
    { name: "ITS Carlo Bergamini (F590)", class: "FREMM", kind: "cruiser", length: 3 },
    { name: "ITS Pietro Venuti (S 528)", class: "Type 212A", kind: "submarine", length: 3 },
    { name: "Comandanti-class Patrol", kind: "destroyer", length: 2 },
  ],
  Spain: [
    { name: "SPS Juan Carlos I (L61)", class: "LHD", kind: "carrier", length: 5 },
    { name: "SPS Álvaro de Bazán (F101)", class: "F100", kind: "battleship", length: 4 },
    { name: "SPS Méndez Núñez (F104)", class: "F100", kind: "cruiser", length: 3 },
    { name: "S-80 Plus (Isaac Peral)", class: "S-80", kind: "submarine", length: 3 },
    { name: "Meteoro-class OPV", kind: "destroyer", length: 2 },
  ],
  Germany: [
    { name: "FGS Bonn (A1413)", class: "Einsatzgruppenversorger", kind: "carrier", length: 5 },
    { name: "FGS Sachsen (F219)", class: "Sachsen-class", kind: "battleship", length: 4 },
    { name: "FGS Baden-Württemberg (F222)", class: "F125", kind: "cruiser", length: 3 },
    { name: "Type 212A Submarine", class: "U-35", kind: "submarine", length: 3 },
    { name: "Braunschweig-class (K130) Corvette", kind: "destroyer", length: 2 },
  ],
  Australia: [
    { name: "HMAS Canberra (L02)", class: "LHD", kind: "carrier", length: 5 },
    { name: "HMAS Hobart (DDG 39)", class: "Hobart-class", kind: "battleship", length: 4 },
    { name: "ANZAC-class Frigate (HMAS Parramatta)", class: "ANZAC", kind: "cruiser", length: 3 },
    { name: "Collins-class Submarine (HMAS Rankin)", class: "Collins", kind: "submarine", length: 3 },
    { name: "Armidale-class Patrol Boat", kind: "destroyer", length: 2 },
  ],
  Canada: [
    { name: "HMCS Ottawa (FFH 341)", class: "Halifax-class", kind: "carrier", length: 5 },
    { name: "HMCS Halifax", class: "Halifax-class", kind: "battleship", length: 4 },
    { name: "Harry DeWolf-class (AOPS)", class: "Arctic patrol", kind: "cruiser", length: 3 },
    { name: "Victoria-class Submarine (HMCS Victoria)", kind: "submarine", length: 3 },
    { name: "Kingston-class MCDV", kind: "destroyer", length: 2 },
  ],
  Turkey: [
    { name: "TCG Anadolu (L-400)", class: "LHD", kind: "carrier", length: 5 },
    { name: "TCG Istanbul (F-515)", class: "I-class", kind: "battleship", length: 4 },
    { name: "Gabya-class Frigate (ex-Oliver Hazard Perry)", kind: "cruiser", length: 3 },
    { name: "Type 214TN Submarine (Reis-class)", kind: "submarine", length: 3 },
    { name: "Ada-class Corvette (TCG Heybeliada)", kind: "destroyer", length: 2 },
  ],
  Brazil: [
    { name: "NAM Atlântico (A140)", class: "Helicopter carrier", kind: "carrier", length: 5 },
    { name: "Barroso-class Corvette (V34)", kind: "battleship", length: 4 },
    { name: "Tamandaré-class (future)", kind: "cruiser", length: 3 },
    { name: "Tupi-class Submarine (S30)", kind: "submarine", length: 3 },
    { name: "Macaé-class Patrol", kind: "destroyer", length: 2 },
  ],
};

export function getFleetForCountry(countryCode: string): Vessel[] {
  return Fleets[countryCode] || Fleets.USA;
}

export function getCountryList(): { code: string; name: string; flag: string }[] {
  return [
    { code: "USA", name: "United States", flag: "🇺🇸" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
    { code: "France", name: "France", flag: "🇫🇷" },
    { code: "Japan", name: "Japan", flag: "🇯🇵" },
    { code: "India", name: "India", flag: "🇮🇳" },
    { code: "China", name: "China", flag: "🇨🇳" },
    { code: "Russia", name: "Russia", flag: "🇷🇺" },
    { code: "SouthKorea", name: "South Korea", flag: "🇰🇷" },
    { code: "Italy", name: "Italy", flag: "🇮🇹" },
    { code: "Spain", name: "Spain", flag: "🇪🇸" },
    { code: "Germany", name: "Germany", flag: "🇩🇪" },
    { code: "Australia", name: "Australia", flag: "🇦🇺" },
    { code: "Canada", name: "Canada", flag: "🇨🇦" },
    { code: "Turkey", name: "Turkey", flag: "🇹🇷" },
    { code: "Brazil", name: "Brazil", flag: "🇧🇷" },
  ];
}

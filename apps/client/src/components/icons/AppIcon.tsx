import { SVGProps } from "react";

export const AppIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
    <rect width="100" height="100" rx="15" fill="#002244"/>
    <rect x="15" y="25" width="70" height="50" rx="5" fill="#002244" stroke="#FFFFFF" strokeWidth="5"/>
    <path d="M25 50 C 40 30, 60 30, 75 50 C 60 70, 40 70, 25 50 Z" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="7" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="4" fill="#002244"/>
    <rect x="40" y="75" width="20" height="10" fill="#FFFFFF"/>
    <rect x="35" y="75" width="30" height="5" fill="#FFFFFF"/>
  </svg>
); 
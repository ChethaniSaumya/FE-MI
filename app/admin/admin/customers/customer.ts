export type Customer = {
  id: number;
  image: string;
  name: string;
  displayName: string;
  phone: string;
  email: string;
};

const customers: Customer[] = [
  {
    id: 1,
    image: "/vercel.svg",
    name: "Lahiru Rathnayake",
    displayName: "ApeX1212",
    phone: "0775443213",
    email: "lahiru@gmail.com",
  },
  {
    id: 2,
    image: "/globe.svg",
    name: "Kavinda Manohara",
    displayName: "KaviM",
    phone: "0712345678",
    email: "kavinda@gmail.com",
  },
  {
    id: 3,
    image: "/next.svg",
    name: "Nipun Perera",
    displayName: "Nipz",
    phone: "0756789123",
    email: "nipun@gmail.com",
  },
  {
    id: 4,
    image: "/vercel.svg",
    name: "Sahan Jayasuriya",
    displayName: "SahanJ",
    phone: "0771234567",
    email: "sahan@gmail.com",
  },
  {
    id: 5,
    image: "/file.svg",
    name: "Tharindu Silva",
    displayName: "ThariS",
    phone: "0723456789",
    email: "tharindu@gmail.com",
  },
  {
    id: 6,
    image: "/window.svg",
    name: "Ishara Fernando",
    displayName: "IshaF",
    phone: "0789123456",
    email: "ishara@gmail.com",
  },
  {
    id: 7,
    image: "/vercel.svg",
    name: "Kasun Madushanka",
    displayName: "KasunM",
    phone: "0709876543",
    email: "kasun@gmail.com",
  },
  {
    id: 8,
    image: "/globe.svg",
    name: "Dineth Wijesinghe",
    displayName: "DinethW",
    phone: "0765432198",
    email: "dineth@gmail.com",
  },
  {
    id: 9,
    image: "/globe.svg",
    name: "Dineth Wijesinghe",
    displayName: "DinethW",
    phone: "0765432198",
    email: "dineth@gmail.com",
  },
];

export function getCustomers(): Customer[] {
  return customers;
} 
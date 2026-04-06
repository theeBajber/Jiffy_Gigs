export interface Contact {
  id: string;
  avatar: string;
  name: string;
  messages: Message[];
  time: string;
  online?: boolean;
  role: string;
  phone?: string;
  typing?: boolean;
  email?: string;
}
export interface Message {
  content: string;
  time: string;
  sentBy: "user" | "contact";
  status?: "sent" | "delivered" | "read";
}

export const contacts: Contact[] = [
  {
    id: "1",
    avatar: "/portraits/person2.jpg",
    name: "Sarah Jenkins",
    messages: [
      {
        content: "Hey, can you do the logo by tonight?",
        time: "12:45 PM",
        sentBy: "contact",
        status: "read",
      },
      {
        content: "Sure, I'll have it ready by 8 PM",
        time: "12:46 PM",
        sentBy: "user",
        status: "read",
      },
      {
        content: "Great! Let me know if you need any assets",
        time: "12:47 PM",
        sentBy: "contact",
        status: "delivered",
      },
    ],
    time: "12:45 PM",
    online: true,
    role: "Hair Stylist",
    phone: "+1 234 567 890",
    typing: true,
    email: "sarah.j@example.com",
  },
  {
    id: "2",
    avatar: "/portraits/person1.jpg",
    name: "Ian Nzomo",
    messages: [
      {
        content: "Hey, can you do the logo by tonight?",
        time: "12:45 PM",
        sentBy: "contact",
        status: "read",
      },
      {
        content: "Sure, I'll have it ready by 8 PM",
        time: "12:46 PM",
        sentBy: "user",
        status: "read",
      },
      {
        content: "Great! Let me know if you need any assets",
        time: "12:47 PM",
        sentBy: "contact",
        status: "delivered",
      },
    ],
    time: "11:30 AM",
    online: false,
    role: "UI/UX Designer",
    typing: false,
    phone: "+1 234 567 891",
    email: "ian.n@example.com",
  },
];

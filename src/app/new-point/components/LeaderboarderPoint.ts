// Create the PointType array
const LeaderboardpointTypes: string[] = [
  "Referral Points",
  "Swap Points",
  "Bridge Points",
  "Limit Order Points",
  "Partnership Points"
];

// Define the User interface
interface User {
  name: string;
  referralPoints: number;
  swapPoints: number;
  bridgePoints: number;
  limitOrderPoints: number;
  partnershipPoints: number;
}

// Create the users array
const users: User[] = [
  {
    name: "username",
    referralPoints: 21,
    swapPoints: 21,
    bridgePoints: 21,
    limitOrderPoints: 21,
    partnershipPoints: 21
  },
  {
    name: "username",
    referralPoints: 21,
    swapPoints: 21,
    bridgePoints: 21,
    limitOrderPoints: 21,
    partnershipPoints: 21
  },
  {
    name: "username",
    referralPoints: 21,
    swapPoints: 21,
    bridgePoints: 21,
    limitOrderPoints: 21,
    partnershipPoints: 21
  },
  {
    name: "username",
    referralPoints: 21,
    swapPoints: 21,
    bridgePoints: 21,
    limitOrderPoints: 21,
    partnershipPoints: 21
  },
  {
    name: "username",
    referralPoints: 21,
    swapPoints: 21,
    bridgePoints: 21,
    limitOrderPoints: 21,
    partnershipPoints: 21
  }
];

export { users, type User , LeaderboardpointTypes};

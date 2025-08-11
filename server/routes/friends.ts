import { RequestHandler } from "express";

export interface FriendsResponse {
  friends: any[];
  message: string;
  success: boolean;
}

export const handleFriends: RequestHandler = (req, res) => {
  try {
    const response: FriendsResponse = {
      friends: [],
      message: 'Friends data fetched successfully',
      success: true
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in friends endpoint:', error);
    res.status(500).json({
      friends: [],
      message: 'Internal server error',
      success: false
    });
  }
};

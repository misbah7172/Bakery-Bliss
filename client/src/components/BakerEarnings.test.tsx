import '@testing-library/jest-dom';
import React from "react";
import { render, screen } from "@testing-library/react";
import BakerEarnings from "./BakerEarnings";

// Mock the useQuery hook from @tanstack/react-query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

const { useQuery } = require("@tanstack/react-query");

describe("BakerEarnings", () => {
  it("renders loading state", () => {
    useQuery.mockReturnValue({ isLoading: true });
    render(<BakerEarnings />);
    expect(screen.getByText(/Earnings/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument(); // Clock icon
  });

  it("renders earnings summary", () => {
    useQuery.mockReturnValue({
      isLoading: false,
      data: {
        bakerId: 1,
        totalEarnings: 200,
        earningsBreakdown: [
          {
            orderId: 1,
            amount: "100",
            percentage: "50",
            bakerType: "main_baker",
            createdAt: new Date().toISOString(),
            orderNumber: "A123",
            orderTotal: "200"
          },
          {
            orderId: 2,
            amount: "100",
            percentage: "50",
            bakerType: "junior_baker",
            createdAt: new Date().toISOString(),
            orderNumber: "A124",
            orderTotal: "200"
          }
        ]
      }
    });
    render(<BakerEarnings />);
    expect(screen.getByText(/Total Earnings/i)).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();
    expect(screen.getByText(/Completed Orders/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/Earnings History/i)).toBeInTheDocument();
    expect(screen.getByText(/Order A123/i)).toBeInTheDocument();
    expect(screen.getByText(/Order A124/i)).toBeInTheDocument();
  });
}); 
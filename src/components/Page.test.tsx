/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render } from "@testing-library/react";
import Page from "./Page";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock URL APIs
global.URL.createObjectURL = jest.fn(() => "test-url");
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
) as jest.Mock;

describe("Page Component", () => {
  const mockUser = {
    access_token: "test-token",
    username: "testuser",
  } as any;

  const mockChangeSnackbarState = jest.fn() as React.Dispatch<
    React.SetStateAction<CustomSnackbarStateType>
  >;

  const mockSnackbarState: CustomSnackbarStateType = {
    isOpen: false,
    message: "",
    severity: "success",
  };

  const mockNullifyPageStateFunction = jest.fn();

  it("renders children correctly", () => {
    const { getByText } = render(
      <Page
        user={mockUser}
        nullifyPageStateFunction={mockNullifyPageStateFunction}
        changeSnackbarState={mockChangeSnackbarState}
        snackbarState={mockSnackbarState}
      >
        <div>test child</div>
      </Page>
    );

    expect(getByText("test child")).toBeInTheDocument();
  });
});

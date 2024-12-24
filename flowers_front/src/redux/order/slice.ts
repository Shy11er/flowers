// src/store/orderSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IOrder {
    fullName: string;
    phoneNumber: string;
    isSelfPickup: boolean;
    recipientName?: string;
    recipientPhone?: string;
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    apartment?: string;
    deliveryMethod?: string;
    deliveryTime?: string;
    deliveryDate?: string;
    wishes?: string; // Пожелания
    cardText?: string; // Текст на открытке
}

interface OrderState {
    currentStep: number;
    formData: IOrder;
    errors: { [key: string]: string };
}

const initialState: OrderState = {
    currentStep: 4,
    formData: {
        fullName: "",
        phoneNumber: "",
        isSelfPickup: true,
        recipientName: "",
        recipientPhone: "",
        city: "",
        street: "",
        house: "",
        building: "",
        apartment: "",
        deliveryMethod: "DELIVERY",
        deliveryDate: "",
        deliveryTime: "",
        wishes: "", // Пожелания
        cardText: "", // Текст на открытке
    },
    errors: {},
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setStep(state, action: PayloadAction<number>) {
            state.currentStep = action.payload;
        },
        setFormData(state, action: PayloadAction<Partial<IOrder>>) {
            state.formData = { ...state.formData, ...action.payload };
        },
        setErrors(state, action: PayloadAction<{ [key: string]: string }>) {
            state.errors = action.payload;
        },
        toggleSelfPickup(state) {
            state.formData.isSelfPickup = !state.formData.isSelfPickup;
            if (state.formData.isSelfPickup) {
                state.formData.recipientName = "";
                state.formData.recipientPhone = "";
            }
            state.errors.recipientName = "";
            state.errors.recipientPhone = "";
        },

        clearOrderError(state, action: PayloadAction<string>) {
            delete state.errors[action.payload];
        },
        resetOrder(state) {
            state.formData = initialState.formData;
            state.errors = {};
        },
    },
});

export const {
    setStep,
    setFormData,
    setErrors,
    toggleSelfPickup,
    clearOrderError,
    resetOrder,
} = orderSlice.actions;

export default orderSlice.reducer;

import React from "react";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";

const FormComponent = ({ formData, onChange }) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-start">
                    <InputLabel htmlFor="firstName" value="First Name" />
                    <TextInput
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="mt-1 block w-full"
                        isFocused={true}
                        value={formData.firstName}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="text-start">
                    <InputLabel htmlFor="lastName" value="Last Name" />
                    <TextInput
                        className="mt-1 block w-full"
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="text-start">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        className="mt-1 block w-full"
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="text-start">
                    <InputLabel htmlFor="contactNo" value="Contact No." />
                    <TextInput
                        className="mt-1 block w-full"
                        type="text"
                        id="contactNo"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={onChange}
                        required
                    />
                </div>
            </div>
            <div className="text-start mt-3 mb-3">
                <InputLabel htmlFor="birthDate" value="Birth Date" />
                <TextInput
                    className="mt-1 block w-full"
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={onChange}
                    required
                />
            </div>
        </div>
    );
};

export default FormComponent;

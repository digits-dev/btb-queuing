import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Player } from "@lottiefiles/react-lottie-player";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-10 md:flex">
                {/* Left Side - Animation / Info */}
                <div className="hidden md:flex w-full md:w-1/2 bg-gray-800 text-white items-center justify-center p-8">
                    <div>
                        <div className="mb-4">
                            <Player
                                autoplay
                                loop
                                src="/img/Login.json"
                                style={{ height: "250px", width: "300px" }}
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-center mb-2">Forgot Your Password?</h2>
                        <p className="text-sm text-center text-gray-300">
                            No worries — we'll send you instructions to reset it.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-6 md:p-10">
                    <div className="mb-4 flex items-center justify-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <ApplicationLogo className="h-12 w-12" />
                        </Link>
                    </div>
                    <h2 className="text-xl text-center font-bold text-gray-700 my-6">Reset Your Password</h2>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-6">
                            <PrimaryButton className="w-full flex items-center justify-center" disabled={processing}>
                                Email Password Reset Link
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}

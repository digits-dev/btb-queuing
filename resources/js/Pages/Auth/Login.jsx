import ApplicationLogo from '@/Components/ApplicationLogo';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, } from '@inertiajs/react';
import { Player } from "@lottiefiles/react-lottie-player";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto md:flex">
                {/* Left Section - Welcome Panel */}
                <div className="w-full md:w-1/2 bg-gray-800 text-white p-8">
                    <div className='mb-4'>
                        <Player
                            autoplay
                            loop
                            src="/img/Login.json"
                            style={{ height: "270px", width: "300px" }}
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
                        <p className="text-sm">Sign in to manage your services efficiently.</p>
                    </div>
                </div>

                {/* Right Section - Login Form */}
                <div className="w-full md:w-1/2 p-6 md:p-10">
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="mb-4 flex items-center justify-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <ApplicationLogo className="h-12 w-12" />
                            </Link>
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            {/* <label className="flex items-center space-x-2 text-sm">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-gray-700">Remember me</span>
                            </label> */}

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-indigo-500 hover:underline"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </div>

                        <PrimaryButton
                            className="w-full flex items-center justify-center"
                            disabled={processing}
                        >
                            Sign in
                        </PrimaryButton>

                        <div className="text-center text-sm mt-2">
                            Don’t have an account?{' '}
                            <Link
                                href={route('register')}
                                className="text-indigo-600 hover:underline"
                            >
                                Register here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}

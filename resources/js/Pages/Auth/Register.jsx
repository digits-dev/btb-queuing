import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Player } from "@lottiefiles/react-lottie-player";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        contact: '',
        birthdate: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-10 md:flex">
                {/* Left Side - Banner / Info */}
                <div className="hidden md:flex w-full md:w-1/2 bg-gray-800 text-white items-center justify-center p-8">
                    <div>
                        <div className='mb-4'>
                            <Player
                                autoplay
                                loop
                                src="/img/Login.json"
                                style={{ height: "350px", width: "300px" }}
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-4 text-center">Create Your Account</h2>
                            <p className="text-sm text-center">Join us today and enjoy seamless service.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className="w-full md:w-1/2 p-6 md:p-10">
                    <div className="mb-4 flex items-center justify-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <ApplicationLogo className="h-12 w-12" />
                        </Link>
                    </div>
                    <form onSubmit={submit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="first_name" value="First Name" />
                                <TextInput
                                    id="first_name"
                                    name="first_name"
                                    value={data.first_name}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.first_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="last_name" value="Last Name" />
                                <TextInput
                                    id="last_name"
                                    name="last_name"
                                    value={data.last_name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.last_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="contact" value="Contact No." />
                                <TextInput
                                    id="contact"
                                    type="number"
                                    name="contact"
                                    value={data.contact}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('contact', e.target.value)}
                                    required
                                />
                                <InputError message={errors.contact} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="birthdate" value="Birth Date" />
                            <TextInput
                                id="birthdate"
                                type="date"
                                name="birthdate"
                                value={data.birthdate}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('birthdate', e.target.value)}
                                required
                            />
                            <InputError message={errors.birthdate} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <Link
                                href={route('login')}
                                className="text-sm text-indigo-500 hover:underline"
                            >
                                Already registered?
                            </Link>
                            <PrimaryButton className="" disabled={processing}>
                                Register
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}

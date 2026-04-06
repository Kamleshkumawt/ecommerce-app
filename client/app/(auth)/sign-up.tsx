import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useSignUp } from '@clerk/expo';
import { COLORS } from '@/constants';

export default function SignUpScreen() {
    const { signUp, errors, fetchStatus } = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [code, setCode] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const { error } = await signUp.password({
            emailAddress,
            password,
        });

        if (error) {
            console.error(JSON.stringify(error, null, 2));
            return;
        }

        // Send verification code after successful sign-up
        if (!error) {
            await signUp.verifications.sendEmailCode();
        }
        setPendingVerification(true);
    };

    const handleVerify = async () => {
        await signUp.verifications.verifyEmailCode({ code });
        if (signUp.status === 'complete') {
            // After verification, update the user's profile with first name and last name
            console.log('Sign-up attempt complete:', signUp);
            try {
                await signUp.finalize({
                    navigate: ({ session, decorateUrl }) => {
                        if (session?.currentTask) {
                            console.log(session?.currentTask);
                            return;
                        }

                        const url = decorateUrl('/');
                        if (url.startsWith('http')) {
                            window.location.href = url;
                        } else {
                            router.push(url as any);
                        }
                    },
                });
            } catch (profileError) {
                console.error('Error updating profile:', profileError);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to Update Profile',
                    text2: 'Could not update profile information.',
                });
            }
        } else {
            console.error('Sign-up attempt not complete:', signUp);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 28 }}>
            {!pendingVerification ? (
                <>
                    <TouchableOpacity onPress={() => router.push('/')} style={{ position: 'absolute', top: 12, zIndex: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 }}>Create Account</Text>
                        <Text style={{ color: '#666' }}>Sign up to get started</Text>
                    </View>

                    {/* First Name */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: COLORS.primary, fontWeight: '500', marginBottom: 8 }}>First Name</Text>
                        <TextInput
                            style={{ width: '100%', backgroundColor: '#f4f4f4', padding: 16, borderRadius: 8, color: COLORS.primary }}
                            placeholder="John"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    {/* Last Name */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: COLORS.primary, fontWeight: '500', marginBottom: 8 }}>Last Name</Text>
                        <TextInput
                            style={{ width: '100%', backgroundColor: '#f4f4f4', padding: 16, borderRadius: 8, color: COLORS.primary }}
                            placeholder="Doe"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    {/* Email */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: COLORS.primary, fontWeight: '500', marginBottom: 8 }}>Email</Text>
                        <TextInput
                            style={{ width: '100%', backgroundColor: '#f4f4f4', padding: 16, borderRadius: 8, color: COLORS.primary }}
                            placeholder="user@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                        />
                        {errors.fields.emailAddress && (
                            <Text style={{ color: '#d32f2f', fontSize: 12, marginTop: -8 }}>
                                {errors.fields.emailAddress.message}
                            </Text>
                        )}
                    </View>

                    {/* Password */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: COLORS.primary, fontWeight: '500', marginBottom: 8 }}>Password</Text>
                        <TextInput
                            style={{ width: '100%', backgroundColor: '#f4f4f4', padding: 16, borderRadius: 8, color: COLORS.primary }}
                            placeholder="********"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        {errors.fields.password && (
                            <Text style={{ color: '#d32f2f', fontSize: 12, marginTop: -8 }}>
                                {errors.fields.password.message}
                            </Text>
                        )}
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={{
                            width: '100%',
                            backgroundColor: COLORS.primary,
                            paddingVertical: 16,
                            borderRadius: 50,
                            alignItems: 'center',
                            marginBottom: 32,
                        }}
                        onPress={handleSubmit}
                        disabled={loading || !emailAddress || !password}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ color: '#666' }}>Already have an account? </Text>
                        <Link href="/sign-in">
                            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Login</Text>
                        </Link>
                    </View>
                </>
            ) : (
                <>
                    <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 12, zIndex: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    {/* Verification */}
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 }}>Verify Email</Text>
                        <Text style={{ color: '#666', textAlign: 'center' }}>Enter the code sent to your email</Text>
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <TextInput
                            style={{
                                width: '100%',
                                backgroundColor: '#f4f4f4',
                                padding: 16,
                                borderRadius: 8,
                                color: COLORS.primary,
                                textAlign: 'center',
                                letterSpacing: 3,
                            }}
                            placeholder="123456"
                            keyboardType="number-pad"
                            value={code}
                            onChangeText={setCode}
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            width: '100%',
                            backgroundColor: COLORS.primary,
                            paddingVertical: 16,
                            borderRadius: 50,
                            alignItems: 'center',
                        }}
                        onPress={handleVerify}
                        disabled={loading || !code}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Verify</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
}
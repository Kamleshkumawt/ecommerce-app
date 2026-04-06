import { COLORS } from "@/constants";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Pressable, TextInput, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define a custom type for MFA factors
type MFAFactor = {
  strategy: string;
  emailAddressId?: string;
};

export default function Page() {
  const { signIn, setSession, isLoaded, error } = useSignIn(); // isLoaded is used to check if Clerk has finished loading
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSignInPress = async () => {
    if (!isLoaded || !emailAddress || !password) return;

    setLoading(true);

    try {
      // Create sign-in attempt
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        // If the sign-in is complete, set the session
        await setSession(signInAttempt.createdSessionId);
        router.replace("/");
      } else if (signInAttempt.status === "needs_second_factor") {
        // Handle second-factor authentication (MFA)
        const emailCodeFactor: MFAFactor | undefined = signInAttempt.secondFactors?.find(
          (factor) => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          // Send second-factor email code
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true); // Show email code verification UI
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || !code) return;

    setLoading(true);

    try {
      // Attempt to verify second-factor authentication
      const attempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (attempt.status === "complete") {
        // Complete the session after verifying MFA
        await setSession(attempt.createdSessionId);
        router.replace("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-7 py-8">
      {!showEmailCode ? (
        <>
          <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary mb-2">Welcome Back</Text>
            <Text className="text-secondary text-lg">Sign in to continue</Text>
          </View>

          <View className="mb-4">
            <Text className="text-primary font-medium mb-2">Email</Text>
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="user@example.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          <View className="mb-6">
            <Text className="text-primary font-medium mb-2">Password</Text>
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="********"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            className={`w-full py-4 rounded-full items-center mb-10 ${loading || !emailAddress || !password ? "bg-gray-300" : "bg-primary"}`}
            onPress={onSignInPress}
            disabled={loading || !emailAddress || !password}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
          </Pressable>

          <View className="flex-row justify-center">
            <Text className="text-secondary">{"Don't have an account?"}</Text>
            <Link href="/sign-up">
              <Text className="text-primary font-bold">Sign up</Text>
            </Link>
          </View>
        </>
      ) : (
        <>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary mb-2">Verify Email</Text>
            <Text className="text-secondary text-center">Enter the code sent to your email</Text>
          </View>

          <View className="mb-6">
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
              placeholder="123456"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
          </View>

          <Pressable
            className="w-full bg-primary py-4 rounded-full items-center"
            onPress={onVerifyPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Verify</Text>}
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}
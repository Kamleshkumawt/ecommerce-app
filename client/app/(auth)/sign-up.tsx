import { COLORS } from "@/constants";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const username = (firstName + lastName).replace(/\s+/g, "_");

    // Additional check for valid characters
    const usernameRegex = /^[A-Za-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      console.log(
        "Invalid username. Please use only letters, numbers, hyphens, or underscores.",
      );
      return; // Exit the function if username is invalid
    }

    setLoading(true);
    const { error } = await signUp.password({
      emailAddress,
      password,
      username: username,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    if (!error) await signUp.verifications.sendEmailCode();
    setLoading(false);
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          padding: 28,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 12, zIndex: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Verification */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: COLORS.primary,
              marginBottom: 8,
            }}
          >
            Verify Email
          </Text>
          <Text style={{ color: "#666", textAlign: "center" }}>
            Enter the code sent to your email
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <TextInput
            style={{
              width: "100%",
              backgroundColor: "#f4f4f4",
              padding: 16,
              borderRadius: 8,
              color: COLORS.primary,
              textAlign: "center",
              letterSpacing: 3,
            }}
            placeholder="123456"
            keyboardType="number-pad"
            value={code}
            onChangeText={(code) => setCode(code)}
          />
        </View>

        <TouchableOpacity
          style={{
            width: "100%",
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: 50,
            alignItems: "center",
          }}
          onPress={handleVerify}
          disabled={loading || !code || fetchStatus === "fetching"}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Verify
            </Text>
          )}
        </TouchableOpacity>
        <Pressable
          style={({ pressed }) => [
            {
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text style={{ color: "#0a7ea4", fontWeight: "600" }}>
            I need a new code
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        padding: 28,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/")}
        style={{ position: "absolute", top: 12, zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: COLORS.primary,
            marginBottom: 8,
          }}
        >
          Create Account
        </Text>
        <Text style={{ color: "#666" }}>Sign up to get started</Text>
      </View>

      {/* First Name */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: "500",
            marginBottom: 8,
          }}
        >
          First Name
        </Text>
        <TextInput
          style={{
            width: "100%",
            backgroundColor: "#f4f4f4",
            padding: 16,
            borderRadius: 8,
            color: COLORS.primary,
          }}
          placeholder="John"
          value={firstName}
          onChangeText={(firstName) => setFirstName(firstName)}
        />
      </View>

      {/* Last Name */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: "500",
            marginBottom: 8,
          }}
        >
          Last Name
        </Text>
        <TextInput
          style={{
            width: "100%",
            backgroundColor: "#f4f4f4",
            padding: 16,
            borderRadius: 8,
            color: COLORS.primary,
          }}
          placeholder="Doe"
          value={lastName}
          onChangeText={(lastName) => setLastName(lastName)}
        />
      </View>

      {/* Email */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: "500",
            marginBottom: 8,
          }}
        >
          Email
        </Text>
        <TextInput
          style={{
            width: "100%",
            backgroundColor: "#f4f4f4",
            padding: 16,
            borderRadius: 8,
            color: COLORS.primary,
          }}
          placeholder="user@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />
        {errors.fields.emailAddress && (
          <Text style={{ color: "#d32f2f", fontSize: 12, marginTop: -8 }}>
            {errors.fields.emailAddress.message}
          </Text>
        )}
      </View>

      {/* Password */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: "500",
            marginBottom: 8,
          }}
        >
          Password
        </Text>
        <TextInput
          style={{
            width: "100%",
            backgroundColor: "#f4f4f4",
            padding: 16,
            borderRadius: 8,
            color: COLORS.primary,
          }}
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={(password) => setPassword(password)}
        />
        {errors.fields.password && (
          <Text style={{ color: "#d32f2f", fontSize: 12, marginTop: -8 }}>
            {errors.fields.password.message}
          </Text>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={{
          width: "100%",
          backgroundColor: COLORS.primary,
          paddingVertical: 16,
          borderRadius: 50,
          alignItems: "center",
          marginBottom: 32,
        }}
        onPress={handleSubmit}
        disabled={
          loading || !emailAddress || !password || fetchStatus === "fetching"
        }
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
            Continue
          </Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Text style={{ color: "#666" }}>Already have an account? </Text>
        <Link href="/sign-in">
          <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
            Login
          </Text>
        </Link>
      </View>

      {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
      <View nativeID="clerk-captcha" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
});

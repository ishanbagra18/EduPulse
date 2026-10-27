import React from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Avatar from "../../../components/Avatar";
import { useAuthContext } from "../../../hooks/AuthProvider";
import {
  fetchRoleProfilePhoto,
  updateRoleProfilePhoto,
  uploadProfilePhoto,
} from "../../../services/profilePhotos";
import supabase from "../../../services/supabase";

export default function EditProfile() {
  const { user, setUser } = useAuthContext();
  const [name, setName] = React.useState(user?.full_name ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [photoUri, setPhotoUri] = React.useState(user?.profile_image ?? "");
  const [selectedPhoto, setSelectedPhoto] =
    React.useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadRolePhoto() {
      if (!user) return;
      const { photoUrl } = await fetchRoleProfilePhoto(user.id, user.role);
      if (mounted && photoUrl && !user.profile_image) {
        setPhotoUri(photoUrl);
      }
    }

    loadRolePhoto();

    return () => {
      mounted = false;
    };
  }, [user]);

  const setPickedPhoto = (asset: ImagePicker.ImagePickerAsset) => {
    setSelectedPhoto(asset);
    setPhotoUri(asset.uri);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to choose a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPickedPhoto(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow camera access to take a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPickedPhoto(result.assets[0]);
    }
  };

  const onSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let profileImage = user.profile_image;

      if (selectedPhoto) {
        profileImage = await uploadProfilePhoto({
          userId: user.id,
          uri: selectedPhoto.uri,
          mimeType: selectedPhoto.mimeType,
        });
      }

      const { data, error } = await supabase
        .from("users")
        .update({ full_name: name, phone, profile_image: profileImage })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;

      if (profileImage) {
        const { error: rolePhotoError } = await updateRoleProfilePhoto(
          user.id,
          user.role,
          profileImage,
        );
        if (rolePhotoError) throw rolePhotoError;
      }

      setUser(data);
      setSelectedPhoto(null);
      Alert.alert("Saved");
    } catch (err) {
      Alert.alert("Error", String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.photoSection}>
        <Avatar uri={photoUri} size={96} />
        <View style={styles.photoActions}>
          <Button title="Choose Photo" onPress={pickPhoto} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>
      </View>
      <TextInput
        placeholder="Full name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {saving ? (
        <ActivityIndicator />
      ) : (
        <Button title="Save" onPress={onSave} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoActions: {
    gap: 8,
    marginTop: 12,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});

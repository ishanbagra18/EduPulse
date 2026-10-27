import { Picker } from "@react-native-picker/picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Avatar from "../../../../components/Avatar";
import {
  useDeleteUser,
  useUpdateUser,
  useUser,
} from "../../../../hooks/useUsers";
import { fetchClasses } from "../../../../services/classes";
import supabase from "../../../../services/supabase";

export default function UserProfile() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id as string | undefined;
  const { data, isLoading } = useUser(id);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const userData = data as any;

  const [editing, setEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState(userData?.full_name ?? "");
  const [email, setEmail] = React.useState(userData?.email ?? "");
  const [phone, setPhone] = React.useState(userData?.phone ?? "");
  const [role, setRole] = React.useState(userData?.role ?? "student");
  const qc = useQueryClient();

  // Fetch corresponding student/teacher record if present
  const { data: studentRecord, refetch: refetchStudent } = useQuery<any | null>(
    {
      queryKey: ["studentByUser", userData?.id],
      queryFn: async () => {
        if (!userData?.id) return null;
        const { data } = await supabase
          .from("students")
          .select("*")
          .eq("user_id", userData.id)
          .maybeSingle();
        return data ?? null;
      },
      enabled: !!userData?.id && role === "student",
    },
  );

  const { data: teacherRecord, refetch: refetchTeacher } = useQuery<any | null>(
    {
      queryKey: ["teacherByUser", userData?.id],
      queryFn: async () => {
        if (!userData?.id) return null;
        const { data } = await supabase
          .from("teachers")
          .select("*")
          .eq("user_id", userData.id)
          .maybeSingle();
        return data ?? null;
      },
      enabled: !!userData?.id && role === "teacher",
    },
  );

  const [editingStudent, setEditingStudent] = React.useState(false);
  const [editingTeacher, setEditingTeacher] = React.useState(false);

  // Student form state
  const [admissionNumber, setAdmissionNumber] = React.useState("");
  const [rollNumber, setRollNumber] = React.useState("");
  const [studentClassId, setStudentClassId] = React.useState("");
  const [section, setSection] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [emergencyContact, setEmergencyContact] = React.useState("");
  const [parentName, setParentName] = React.useState("");
  const [parentPhone, setParentPhone] = React.useState("");

  const { data: classes, isLoading: loadingClasses } = useQuery<any[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await fetchClasses();
      return res.data ?? [];
    },
  });

  // Teacher form state
  const [qualification, setQualification] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [joiningDate, setJoiningDate] = React.useState("");
  const [teacherAddress, setTeacherAddress] = React.useState("");

  React.useEffect(() => {
    if (userData) {
      setFullName(userData.full_name ?? "");
      setEmail(userData.email ?? "");
      setPhone(userData.phone ?? "");
      setRole(userData.role ?? "student");
    }
  }, [userData]);

  React.useEffect(() => {
    if (studentRecord) {
      setAdmissionNumber(studentRecord.admission_number ?? "");
      setRollNumber(studentRecord.roll_number ?? "");
      setStudentClassId(studentRecord.class_id ?? "");
      setSection(studentRecord.section ?? "");
      setGender(studentRecord.gender ?? "");
      setDob(studentRecord.dob ?? "");
      setAddress(studentRecord.address ?? "");
      setEmergencyContact(studentRecord.emergency_contact ?? "");
      setParentName(studentRecord.parent_name ?? "");
      setParentPhone(studentRecord.parent_phone ?? "");
    }
  }, [studentRecord]);

  React.useEffect(() => {
    if (teacherRecord) {
      setQualification(teacherRecord.qualification ?? "");
      setExperience(String(teacherRecord.experience ?? ""));
      setJoiningDate(teacherRecord.joining_date ?? "");
      setTeacherAddress(teacherRecord.address ?? "");
    }
  }, [teacherRecord]);

  if (isLoading) return <ActivityIndicator />;
  if (!userData) return <Text>User not found</Text>;

  const handleApprove = () => {
    updateUser.mutate(
      {
        id: userData.id,
        patch: { is_active: true, is_blocked: false },
      },
      {
        onSuccess: async () => {
          Alert.alert("Success", "User account approved and activated.");
          // refetch related records
          await refetchStudent();
          await refetchTeacher();
        },
        onError: () => Alert.alert("Error", "Unable to approve this user."),
      },
    );
  };

  const handleBlock = () => {
    updateUser.mutate(
      {
        id: userData.id,
        patch: { is_blocked: true, is_active: false },
      },
      {
        onSuccess: () => Alert.alert("Success", "User account blocked."),
        onError: () => Alert.alert("Error", "Unable to block this user."),
      },
    );
  };

  const handleUnblock = () => {
    updateUser.mutate(
      {
        id: userData.id,
        patch: { is_blocked: false, is_active: true },
      },
      {
        onSuccess: () => Alert.alert("Success", "User account unblocked."),
        onError: () => Alert.alert("Error", "Unable to unblock this user."),
      },
    );
  };

  const handleSave = () => {
    updateUser.mutate(
      {
        id: userData.id,
        patch: {
          full_name: fullName,
          email,
          phone,
          role,
          updated_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Saved", "User profile updated.");
          setEditing(false);
        },
        onError: () => Alert.alert("Error", "Unable to update this user."),
      },
    );
  };

  const handleSaveStudent = async () => {
    if (!userData?.id) return;
    try {
      if (studentRecord?.id) {
        await supabase
          .from("students")
          .update({
            admission_number: admissionNumber || null,
            roll_number: rollNumber || null,
            class_id: studentClassId || null,
            section: section || null,
            gender: gender || null,
            dob: dob || null,
            address: address || null,
            emergency_contact: emergencyContact || null,
            parent_name: parentName || null,
            parent_phone: parentPhone || null,
          })
          .eq("id", studentRecord.id);
      } else {
        await supabase.from("students").insert({
          user_id: userData.id,
          admission_number: admissionNumber || null,
          roll_number: rollNumber || null,
          class_id: studentClassId || null,
          section: section || null,
          gender: gender || null,
          dob: dob || null,
          address: address || null,
          emergency_contact: emergencyContact || null,
          parent_name: parentName || null,
          parent_phone: parentPhone || null,
          status: "active",
        });
      }
      Alert.alert("Saved", "Student record saved.");
      setEditingStudent(false);
      qc.invalidateQueries({ queryKey: ["studentByUser", userData.id] });
      await refetchStudent();
    } catch (e) {
      Alert.alert("Error", "Unable to save student record.");
    }
  };

  const handleSaveTeacher = async () => {
    if (!userData?.id) return;
    try {
      if (teacherRecord?.id) {
        await supabase
          .from("teachers")
          .update({
            qualification: qualification || null,
            experience: experience ? Number(experience) : null,
            joining_date: joiningDate || null,
            address: teacherAddress || null,
          })
          .eq("id", teacherRecord.id);
      } else {
        await supabase.from("teachers").insert({
          user_id: userData.id,
          qualification: qualification || null,
          experience: experience ? Number(experience) : null,
          joining_date: joiningDate || null,
          address: teacherAddress || null,
          status: "active",
        });
      }
      Alert.alert("Saved", "Teacher record saved.");
      setEditingTeacher(false);
      qc.invalidateQueries({ queryKey: ["teacherByUser", userData.id] });
      await refetchTeacher();
    } catch (e) {
      Alert.alert("Error", "Unable to save teacher record.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete user", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteUser.mutate(userData.id, {
            onSuccess: () => {
              Alert.alert("Deleted", "User deleted.");
              router.back();
            },
            onError: () => Alert.alert("Error", "Unable to delete this user."),
          });
        },
      },
    ]);
  };

  if (editing) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 100}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            ...styles.container,
            flexGrow: 1,
            paddingBottom:
              editingStudent || editingTeacher
                ? 360
                : styles.container.marginBottom,
          }}
          contentInset={{
            bottom:
              editingStudent || editingTeacher
                ? 360
                : styles.container.marginBottom,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.title}>Edit user</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone"
            keyboardType="phone-pad"
          />
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={role}
              onValueChange={(v: string | number) => setRole(String(v))}
            >
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Teacher" value="teacher" />
            </Picker>
          </View>
          <View style={styles.buttonWrap}>
            <Button title="Save changes" onPress={handleSave} />
          </View>
          <View style={styles.buttonWrap}>
            <Button title="Cancel" onPress={() => setEditing(false)} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 100}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          ...styles.container,
          flexGrow: 1,
          marginBottom:
            editingStudent || editingTeacher
              ? 360
              : styles.container.marginBottom,
        }}
        contentInset={{
          bottom:
            editingStudent || editingTeacher
              ? 360
              : styles.container.marginBottom,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Avatar uri={userData.profile_image} size={88} />
        <View style={{ height: 12 }} />
        <Text style={styles.name}>{userData.full_name ?? userData.email}</Text>
        <Text>Role: {userData.role}</Text>
        <Text>Phone: {userData.phone}</Text>
        <Text>
          Status:{" "}
          {userData.is_blocked
            ? "Blocked"
            : userData.is_active
              ? "Active"
              : "Pending approval"}
        </Text>
        <View style={{ height: 16 }} />

        {role === "student" && (
          <View>
            <Text style={{ fontWeight: "600", marginTop: 12 }}>Student</Text>
            {studentRecord ? (
              <View>
                <Text>Admission: {studentRecord.admission_number ?? "-"}</Text>
                <Text>Roll: {studentRecord.roll_number ?? "-"}</Text>
                <Text>
                  Class:{" "}
                  {(classes ?? []).find(
                    (c: any) => c.id === studentRecord.class_id,
                  )?.name ??
                    studentRecord.class_id ??
                    "Unassigned"}
                </Text>
                <Text>Gender: {studentRecord.gender ?? "-"}</Text>
                <Text>DOB: {studentRecord.dob ?? "-"}</Text>
                <Text>Address: {studentRecord.address ?? "-"}</Text>
                <Text>
                  Emergency contact: {studentRecord.emergency_contact ?? "-"}
                </Text>
                <Text>Section: {studentRecord.section ?? "-"}</Text>
                <Text>Parent: {studentRecord.parent_name ?? "-"}</Text>
                <View style={{ height: 8 }} />
                {!editingStudent ? (
                  <View style={styles.buttonWrap}>
                    <Button
                      title="Edit student info"
                      onPress={() => setEditingStudent(true)}
                    />
                  </View>
                ) : (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={admissionNumber}
                      onChangeText={setAdmissionNumber}
                      placeholder="Admission number"
                    />
                    <TextInput
                      style={styles.input}
                      value={rollNumber}
                      onChangeText={setRollNumber}
                      placeholder="Roll number"
                    />
                    <View style={styles.pickerWrap}>
                      <Picker
                        selectedValue={studentClassId}
                        onValueChange={(v: string | number) =>
                          setStudentClassId(String(v))
                        }
                      >
                        <Picker.Item label="Select Class" value={""} />
                        {(classes ?? []).map((c: any) => (
                          <Picker.Item
                            key={c.id}
                            label={`${c.name}${c.section ? ` - ${c.section}` : ""}`}
                            value={c.id}
                          />
                        ))}
                      </Picker>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={gender}
                      onChangeText={setGender}
                      placeholder="Gender"
                    />
                    <TextInput
                      style={styles.input}
                      value={dob}
                      onChangeText={setDob}
                      placeholder="DOB (YYYY-MM-DD)"
                    />
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Address"
                    />
                    <TextInput
                      style={styles.input}
                      value={emergencyContact}
                      onChangeText={setEmergencyContact}
                      placeholder="Emergency contact"
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={styles.input}
                      value={section}
                      onChangeText={setSection}
                      placeholder="Section"
                    />
                    <TextInput
                      style={styles.input}
                      value={parentName}
                      onChangeText={setParentName}
                      placeholder="Parent name"
                    />
                    <TextInput
                      style={styles.input}
                      value={parentPhone}
                      onChangeText={setParentPhone}
                      placeholder="Parent phone"
                      keyboardType="phone-pad"
                    />
                    <View style={styles.buttonWrap}>
                      <Button
                        title="Save student"
                        onPress={handleSaveStudent}
                      />
                    </View>
                    <View style={styles.buttonWrap}>
                      <Button
                        title="Cancel"
                        onPress={() => setEditingStudent(false)}
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text>No student record found.</Text>
                {!editingStudent ? (
                  <View style={styles.buttonWrap}>
                    <Button
                      title="Add student details"
                      onPress={() => setEditingStudent(true)}
                    />
                  </View>
                ) : (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={admissionNumber}
                      onChangeText={setAdmissionNumber}
                      placeholder="Admission number"
                    />
                    <TextInput
                      style={styles.input}
                      value={rollNumber}
                      onChangeText={setRollNumber}
                      placeholder="Roll number"
                    />
                    <View style={styles.pickerWrap}>
                      <Picker
                        selectedValue={studentClassId}
                        onValueChange={(v: string | number) =>
                          setStudentClassId(String(v))
                        }
                      >
                        <Picker.Item label="Select Class" value={""} />
                        {(classes ?? []).map((c: any) => (
                          <Picker.Item
                            key={c.id}
                            label={`${c.name}${c.section ? ` - ${c.section}` : ""}`}
                            value={c.id}
                          />
                        ))}
                      </Picker>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={gender}
                      onChangeText={setGender}
                      placeholder="Gender"
                    />
                    <TextInput
                      style={styles.input}
                      value={dob}
                      onChangeText={setDob}
                      placeholder="DOB (YYYY-MM-DD)"
                    />
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Address"
                    />
                    <TextInput
                      style={styles.input}
                      value={emergencyContact}
                      onChangeText={setEmergencyContact}
                      placeholder="Emergency contact"
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={styles.input}
                      value={section}
                      onChangeText={setSection}
                      placeholder="Section"
                    />
                    <TextInput
                      style={styles.input}
                      value={parentName}
                      onChangeText={setParentName}
                      placeholder="Parent name"
                    />
                    <TextInput
                      style={styles.input}
                      value={parentPhone}
                      onChangeText={setParentPhone}
                      placeholder="Parent phone"
                      keyboardType="phone-pad"
                    />
                    <View style={styles.buttonWrap}>
                      <Button
                        title="Save student"
                        onPress={handleSaveStudent}
                      />
                    </View>
                    <View style={styles.buttonWrap}>
                      <Button
                        title="Cancel"
                        onPress={() => setEditingStudent(false)}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {role === "teacher" && (
          <View>
            <Text style={{ fontWeight: "600", marginTop: 12 }}>Teacher</Text>
            {teacherRecord ? (
              <View>
                <Text>Qualification: {teacherRecord.qualification ?? "-"}</Text>
                <Text>Experience: {teacherRecord.experience ?? "-"}</Text>
                <Text>Joining: {teacherRecord.joining_date ?? "-"}</Text>
                <View style={{ height: 8 }} />
                {!editingTeacher ? (
                  <>
                    <Button
                      title="Edit teacher info"
                      onPress={() => setEditingTeacher(true)}
                    />
                    <View style={{ height: 8 }} />
                  </>
                ) : (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={qualification}
                      onChangeText={setQualification}
                      placeholder="Qualification"
                    />
                    <TextInput
                      style={styles.input}
                      value={experience}
                      onChangeText={setExperience}
                      placeholder="Experience (years)"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      value={joiningDate}
                      onChangeText={setJoiningDate}
                      placeholder="Joining date (YYYY-MM-DD)"
                    />
                    <TextInput
                      style={styles.input}
                      value={teacherAddress}
                      onChangeText={setTeacherAddress}
                      placeholder="Address"
                    />
                    <Button title="Save teacher" onPress={handleSaveTeacher} />
                    <View style={{ height: 8 }} />
                    <Button
                      title="Cancel"
                      onPress={() => setEditingTeacher(false)}
                    />
                    <View style={{ height: 8 }} />
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text>No teacher record found.</Text>
                {!editingTeacher ? (
                  <>
                    <Button
                      title="Add teacher details"
                      onPress={() => setEditingTeacher(true)}
                    />
                    <View style={{ height: 8 }} />
                  </>
                ) : (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={qualification}
                      onChangeText={setQualification}
                      placeholder="Qualification"
                    />
                    <TextInput
                      style={styles.input}
                      value={experience}
                      onChangeText={setExperience}
                      placeholder="Experience (years)"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      value={joiningDate}
                      onChangeText={setJoiningDate}
                      placeholder="Joining date (YYYY-MM-DD)"
                    />
                    <TextInput
                      style={styles.input}
                      value={teacherAddress}
                      onChangeText={setTeacherAddress}
                      placeholder="Address"
                    />
                    <Button title="Save teacher" onPress={handleSaveTeacher} />
                    <View style={{ height: 8 }} />
                    <Button
                      title="Cancel"
                      onPress={() => setEditingTeacher(false)}
                    />
                    <View style={{ height: 8 }} />
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {!userData.is_blocked && userData.is_active === false && (
          <View style={styles.buttonWrap}>
            <Button title="Approve user" onPress={handleApprove} />
          </View>
        )}

        {!userData.is_blocked && userData.is_active && (
          <View style={styles.buttonWrap}>
            <Button title="Block user" onPress={handleBlock} />
          </View>
        )}

        {userData.is_blocked && (
          <View style={styles.buttonWrap}>
            <Button title="Unblock user" onPress={handleUnblock} />
          </View>
        )}

        <View style={{ height: 12 }} />
        <View style={styles.buttonWrap}>
          <Button title="Edit Profile" onPress={() => setEditing(true)} />
        </View>
        <View style={styles.buttonWrap}>
          <Button title="Delete" onPress={handleDelete} color="#b91c1c" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginBottom: 180 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  buttonWrap: {
    marginBottom: 16,
  },
});

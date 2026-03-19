import api from "./axios";

export const registerStudent = async (data: {
    email: string;
    password: string;
    full_name: string;
    national_id: string;
    institution: string;
    course: string;
    year_of_study: number;
}) => {
    const res = await api.post("/students/register/student", data);
    return res.data;
};

export const getMyApplications = async () => {
    // Assuming endpoint exists. If not, we might need to adjust.
    const res = await api.get("/applications/my-applications");
    return res.data;
};

export const getStudentProfile = async () => {
    const res = await api.get("/students/profile");
    return res.data;
};

export const updateStudentProfile = async (data: any) => {
    const res = await api.put("/students/profile", data);
    return res.data;
};

const { useState, useEffect } = React;

// Sample school data
const schools = [
    { name: 'Talaricheruvu' },
    { name: 'Boyareddypalli' },
    { name: 'Mantapampalli' },
    { name: 'Ganesh Pahad' },
    { name: 'Tandur' },
    { name: 'ALL' } // Placeholder for combined data
];

// Maximum marks for each sub-column
const maxMarks = [20, 5, 5, 5, 5, 5, 5]; // FA, Speaking, Basic Knowledge, Writing, Corrections, Behaviour, Activity

// Calculate totals, grades, and SGPA
const calculateTotal = marks => marks.slice(0, 7).reduce((a, b) => a + Number(b), 0);

const calculateGrade = total => {
    if (total <= 9) return 'D';
    if (total <= 19) return 'C';
    if (total <= 29) return 'B';
    if (total <= 39) return 'B+';
    if (total <= 45) return 'A';
    return 'A+';
};

const calculateSGPA = subTotal => (subTotal / 50 * 10).toFixed(2); // Assuming total max marks of 50

const calculateGPA = grandTotal => (grandTotal / 250 * 10).toFixed(2); // Assuming total max marks of 250

const calculatePercentage = grandTotal => ((grandTotal / 250) * 100).toFixed(2); // Assuming total max marks of 250

// React component
function StudentMarksEntry() {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [students, setStudents] = useState([]);
    const [isEditable, setIsEditable] = useState(true);

    useEffect(() => {
        const fetchSchoolData = async (school) => {
            const response = await fetch('studentsData.json');
            const data = await response.json();
            const schoolData = data[school] || [];
            return schoolData.map((student, index) => ({
                ...student,
                sno: index + 1,
                telugu: ['', '', '', '', '', '', '', 0, '', 0],
                hindi: ['', '', '', '', '', '', '', 0, '', 0],
                english: ['', '', '', '', '', '', '', 0, '', 0],
                mathematics: ['', '', '', '', '', '', '', 0, '', 0],
                evs: ['', '', '', '', '', '', '', 0, '', 0],
                subject: ['FA', 'Speaking', 'Basic', 'Writing', 'Corrections', 'Behaviour', 'Activity', 0, 'SG', 'SGPA'],
                grandTotal: 0,
                totalGrade: '',
                gpa: 0,
                percentage: 0
            }));
        };

        const fetchAllData = async () => {
            const allData = [];
            for (const school of schools.slice(0, -1)) { // Exclude 'ALL' from the iteration
                const schoolData = await fetchSchoolData(school.name);
                allData.push(...schoolData);
            }
            setStudents(allData);
        };

        if (selectedSchool) {
            if (selectedSchool === 'ALL') {
                fetchAllData();
            } else {
                fetchSchoolData(selectedSchool).then(setStudents);
            }
        }
    }, [selectedSchool]);

    useEffect(() => {
        const savedStudents = localStorage.getItem(`students_${selectedSchool}`);
        if (savedStudents) {
            setStudents(JSON.parse(savedStudents));
        }
    }, [selectedSchool]);

    const handleInputChange = (index, subject, subIndex, value) => {
        const newStudents = [...students];
        const student = newStudents[index];
        const maxValue = maxMarks[subIndex];

        if (value < 0 || value > maxValue) {
            alert(`Enter the marks according to Limit. Maximum allowed is ${maxValue}`);
            return;
        }

        student[subject][subIndex] = value;

        // Update total, grade, SGPA, etc.
        student[subject][7] = calculateTotal(student[subject]);
        student[subject][8] = calculateGrade(student[subject][7]);
        student[subject][9] = calculateSGPA(student[subject][7]);

        student.grandTotal = student.telugu[7] + student.hindi[7] + student.english[7] + student.mathematics[7] + student.evs[7];
        student.totalGrade = calculateGrade(student.grandTotal);
        student.gpa = calculateGPA(student.grandTotal);
        student.percentage = calculatePercentage(student.grandTotal);

        setStudents(newStudents);

        // Save data automatically
        localStorage.setItem(`students_${selectedSchool}`, JSON.stringify(newStudents));

        // Check if all fields are filled
        let allFieldsFilled = true;
        newStudents.forEach(student => {
            ['telugu', 'hindi', 'english', 'mathematics', 'evs'].forEach(subject => {
                student[subject].slice(0, 7).forEach(mark => {
                    if (mark === '') {
                        allFieldsFilled = false;
                    }
                });
            });
        });

        if (allFieldsFilled) {
            alert('The data saved successfully');
            setIsEditable(false);
        }
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleViewSavedData = () => {
        if (selectedSchool === 'ALL') {
            const allData = [];
            schools.slice(0, -1).forEach(school => {
                const savedData = localStorage.getItem(`students_${school.name}`);
                if (savedData) {
                    allData.push(...JSON.parse(savedData));
                }
            });
            if (allData.length) {
                setStudents(allData);
            } else {
                alert('No saved data found');
            }
        } else {
            const savedStudents = localStorage.getItem(`students_${selectedSchool}`);
            if (savedStudents) {
                setStudents(JSON.parse(savedStudents));
            } else {
                alert('No saved data found for the selected school');
            }
        }
    };

    return (
        <div>
            <header>
                <h1>Student Marks Entry</h1>
                <select
                    id="school-dropdown"
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                >
                    <option value="">Select School</option>
                    {schools.map(school => (
                        <option key={school.name} value={school.name}>
                            {school.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleEdit} disabled={isEditable}>Edit</button>
                <button onClick={handleViewSavedData}>View Saved Data</button>
            </header>
            {selectedSchool && (
                <main>
                    <table id="marks-table">
                        <thead>
                            <tr>
                                <th rowSpan="2">Sno</th>
                                <th rowSpan="2">Student Name</th>
                                <th rowSpan="2">Pen Number</th>
                                <th colSpan="10">Telugu</th>
                                <th colSpan="10">Hindi</th>
                                <th colSpan="10">English</th>
                                <th colSpan="10">Mathematics</th>
                                <th colSpan="10">EVS</th>
                                <th rowSpan="2">Grand Total</th>
                                <th rowSpan="2">Total Grade</th>
                                <th rowSpan="2">GPA</th>
                                <th rowSpan="2">Percentage</th>
                            </tr>
                            <tr>
                                <th>FA</th>
                                <th>Speaking</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA</th>
                                <th>Speaking</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA</th>
                                <th>Speaking</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA</th>
                                <th>Speaking</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA</th>
                                <th>Speaking</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.sno}</td>
                                    <td>{student.studentName}</td>
                                    <td>{student.penNumber}</td>
                                    {['telugu', 'hindi', 'english', 'mathematics', 'evs'].map(subject =>
                                        student[subject].map((value, subIndex) => (
                                            <td key={subIndex}>
                                                {isEditable && subIndex < 7 ? (
                                                    <input
                                                        type="number"
                                                        value={value}
                                                        onChange={(e) => handleInputChange(index, subject, subIndex, e.target.value)}
                                                    />
                                                ) : (
                                                    value
                                                )}
                                            </td>
                                        ))
                                    )}
                                    <td>{student.grandTotal}</td>
                                    <td>{student.totalGrade}</td>
                                    <td>{student.gpa}</td>
                                    <td>{student.percentage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            )}
        </div>
    );
}

ReactDOM.render(<StudentMarksEntry />, document.getElementById('root'));


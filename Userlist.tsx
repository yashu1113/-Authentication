import React, { useEffect, useState } from 'react';

interface User {
    name: string;
    email: string;
    role: string;
}

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5); // Dropdown value

    const fetchUsers = async (page: number, limit: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/auth/allusers?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await res.json();
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1); // Reset to page 1 on page size change
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">All Users</h2>

            {/* Page Size Dropdown */}
            <div className="mb-4">
                <label htmlFor="pageSize" className="mr-2 font-medium">
                    Users per page:
                </label>
                <select id="pageSize" value={pageSize} onChange={handlePageSizeChange} className="border px-2 py-1 rounded">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                </select>
            </div>

            {/* User Table */}
            <table className="min-w-full bg-white border rounded shadow">
                <thead>
                    <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, i) => (
                        <tr key={i}>
                            <td className="border p-2">{user.name}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Buttons */}
            <div className="mt-4 flex justify-between items-center">
                <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded">
                    Prev
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button onClick={handleNext} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded">
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserList;

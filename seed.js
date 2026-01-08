const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Payment = require('./models/Payment');
const Notice = require('./models/Notice');
const Room = require('./models/Room');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    await User.deleteMany({});
    await Payment.deleteMany({});
    await Notice.deleteMany({});
    await Room.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const admin = await User.create({
      fullName: 'Admin User',
      studentId: 'ADMIN001',
      email: 'admin@paymyhostel.com',
      password: 'H123',
      phone: '0771234567',
      role: 'admin',
      hostelBlock: 'A',
      roomNumber: 'A01'
    });
    console.log('👨‍💼 Admin created');

    const students = [];
    const studentData = [
      { name: 'Hansani Abeywickrama', id: 'ST001', email: 'hansaniabeywickrama05@gmail.com', block: 'A', room: '01', phone: '0771234567' },
      { name: 'Kasun Perera', id: 'ST002', email: 'kasun.perera@gmail.com', block: 'A', room: '02', phone: '0772345678' },
      { name: 'Nethmi Silva', id: 'ST003', email: 'nethmi.silva@gmail.com', block: 'A', room: '03', phone: '0773456789' },
      { name: 'Tharindu Fernando', id: 'ST004', email: 'tharindu.fernando@gmail.com', block: 'B', room: '01', phone: '0774567890' },
      { name: 'Amaya Jayasinghe', id: 'ST005', email: 'amaya.jayasinghe@gmail.com', block: 'B', room: '02', phone: '0775678901' },
      { name: 'Dinesh Bandara', id: 'ST006', email: 'dinesh.bandara@gmail.com', block: 'B', room: '03', phone: '0776789012' },
      { name: 'Madushi Gamage', id: 'ST007', email: 'madushi.gamage@gmail.com', block: 'C', room: '01', phone: '0777890123' },
      { name: 'Roshan Wijesinghe', id: 'ST008', email: 'roshan.wijesinghe@gmail.com', block: 'C', room: '02', phone: '0778901234' },
      { name: 'Nimali Rathnayake', id: 'ST009', email: 'nimali.rathnayake@gmail.com', block: 'C', room: '03', phone: '0779012345' },
      { name: 'Chathura Dissanayake', id: 'ST010', email: 'chathura.dissanayake@gmail.com', block: 'D', room: '01', phone: '0770123456' },
    ];

    for (const data of studentData) {
      const student = await User.create({
        fullName: data.name,
        studentId: data.id,
        email: data.email,
        password: 'student123',
        phone: data.phone,
        role: 'student',
        hostelBlock: data.block,
        roomNumber: `${data.block}${data.room}`
      });
      students.push(student);
    }
    console.log(`👨‍🎓 Created ${students.length} students`);

    const payments = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'];
    const statuses = ['pending', 'success', 'rejected'];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const numPayments = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numPayments; j++) {
        const payment = await Payment.create({
          user: student._id,
          amount: 20000,
          month: months[j % months.length],
          year: '2024',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          reference: `REF${Date.now()}${i}${j}`,
          description: `Monthly hostel payment for ${months[j % months.length]} 2024`,
          paymentDate: new Date(),
          bankSlip: `uploads/sample-receipt-${i}-${j}.jpg`,
          ...(statuses[j % 3] === 'rejected' && { rejectionReason: 'Unclear bank slip image' }),
          ...(statuses[j % 3] === 'success' && { 
            approvedBy: admin._id,
            approvalDate: new Date()
          })
        });
        payments.push(payment);
      }
    }
    console.log(`💰 Created ${payments.length} payments`);

    const notices = await Notice.create([
      {
        title: 'Water Shutdown Maintenance',
        content: 'Water supply will be shut down on Nov 20 from 10 AM to 5 PM for pipe maintenance.',
        type: 'maintenance',
        priority: 'high',
        createdBy: admin._id,
        isActive: true
      },
      {
        title: 'Monthly Fee Payment Deadline',
        content: 'Please ensure all monthly fees are paid by November 30, 2024. Late payments will incur a 5% penalty.',
        type: 'payment',
        priority: 'high',
        createdBy: admin._id,
        isActive: true
      },
      {
        title: 'Hostel Rules Update',
        content: 'New quiet hours: 10 PM to 7 AM. Visitors must register at the reception desk.',
        type: 'general',
        priority: 'medium',
        createdBy: admin._id,
        isActive: true
      },
      {
        title: 'Electricity Maintenance Scheduled',
        content: 'Scheduled electrical maintenance will be conducted on Nov 18. Please plan accordingly.',
        type: 'maintenance',
        priority: 'medium',
        createdBy: admin._id,
        isActive: true
      },
      {
        title: 'Annual Hostel Event',
        content: 'Join us for the annual hostel fest on December 5, 2024. Registration opens soon!',
        type: 'event',
        priority: 'low',
        createdBy: admin._id,
        isActive: true,
        expiryDate: new Date('2024-12-05')
      }
    ]);
    console.log(`📢 Created ${notices.length} notices`);

    const blocks = ['A', 'B', 'C', 'D'];
    const rooms = [];

    for (const block of blocks) {
      for (let roomNum = 1; roomNum <= 10; roomNum++) {
        const roomNumber = String(roomNum).padStart(2, '0');
        const room = await Room.create({
          hostelBlock: block,
          roomNumber: `${block}${roomNumber}`,
          capacity: 2,
          currentOccupancy: roomNum <= 5 ? 2 : (roomNum <= 8 ? 1 : 0),
          monthlyRent: 20000,
          facilities: ['Bed', 'Study Table', 'Wardrobe', 'Fan', 'WiFi'],
          status: roomNum <= 5 ? 'occupied' : 'available'
        });
        rooms.push(room);
      }
    }
    console.log(`🏠 Created ${rooms.length} rooms`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin: 1 (email: admin@paymyhostel.com, password: H123)`);
    console.log(`   - Students: ${students.length} (password: student123)`);
    console.log(`   - Payments: ${payments.length}`);
    console.log(`   - Notices: ${notices.length}`);
    console.log(`   - Rooms: ${rooms.length}`);
    console.log('\n💡 You can now login with:');
    console.log('   Admin: admin@paymyhostel.com / H123');
    console.log('   Student: hansaniabeywickrama05@gmail.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();

const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');

const checkUpcomingDeadlines = async (io) => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        // Find saved jobs whose deadline is within 3 days and haven't been notified yet (simplified for now)
        const savedJobs = await SavedJob.find({ 
            status: 'saved',
            reminderEnabled: true 
        }).populate('job');

        for (const save of savedJobs) {
            if (save.job && save.job.deadline) {
                const deadline = new Date(save.job.deadline);
                const now = new Date();
                const diff = deadline - now;
                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

                if (daysLeft > 0 && daysLeft <= 3) {
                    // Check if notification already exists to avoid spam
                    const existingNote = await Notification.findOne({
                        recipient: save.user,
                        type: 'job',
                        message: { $regex: save.job.title }
                    });

                    if (!existingNote) {
                        const note = new Notification({
                            recipient: save.user,
                            message: `Reminder: Application deadline for "${save.job.title}" at ${save.job.company} is in ${daysLeft} days!`,
                            type: 'job'
                        });
                        await note.save();
                        
                        if (io) {
                            io.to(save.user.toString()).emit('new_notification', {
                                type: 'job',
                                message: note.message
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in deadline reminder system:', error);
    }
};

module.exports = { checkUpcomingDeadlines };

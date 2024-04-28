const User = require('../models/user');
const Project = require('../models/project');

async function renderProjectPage(req, res, next) {
    const message = req.query.message || null;

    const project = await Project.findById(req.params.id);

    if(!project){
        return res.redirect('/?message=Project not found');
    }

    const creator = await User.findById(project.creator);
    const user = req.session.user;
    const users = await User.find({_id: {$ne: creator._id}});
    const projectUsers = await User.find({ 
        _id: { 
            $in: project.users,
            $ne: project.creator
        } 
    });
    const isCreator = project.creator == user._id;
    

    res.render('../views/projects/project', {message: message, project: project, projectUsers: projectUsers, users: users, isCreator: isCreator, creator: creator});
}  
async function renderCreateProjectPage(req, res, next) {
    const message = req.query.message || null;
    const user = req.session.user;

    const users = await User.find({_id: {$ne: user._id}});
    res.render('../views/projects/create', {message: message, users: users, authUser: user});
}
async function renderIndexPage(req, res, next){
    const message = req.query.message || null;

    const user = await User.findById(req.session.user._id);
    const projects = await Project.find();
    const userProjects = await Project.find({_id: {$in: user.projects}, archived: false, creator: {$ne: user._id}});
    const createdProjects = await Project.find({creator: user._id, archived: false});
    const archivedProjects = await Project.find({_id: {$in: user.projects}, archived: true});
    
    res.render('../views/projects/index', {
        message: message, 
        projects: projects, 
        userProjects: userProjects, 
        createdProjects: createdProjects, 
        archivedProjects: archivedProjects
    });
}

async function create(req, res){
    const { name, description, completed_jobs, price, start_date, end_date} = req.body;
    
    var archived = req.body['archived'] ? true : false;
    
    var creator = req.session.user;
    var users = req.body['users[]'];
    if (!Array.isArray(users)) {
        users = [users];
    }
    users = users.filter(value => value !== null && value !== '');
    users.push(creator._id);
    users = new Set(users);
    users = Array.from(users);

    try {
        const project = new Project({
            name,
            description,
            price,
            completed_jobs,
            start_date,
            end_date,
            users,
            creator,
            archived
        });

        await project.save();

        const usersToUpdate = await User.find({ _id: { $in: users } });

        await Promise.all(usersToUpdate.map(async user => {
            user.projects.push(project._id);
            await user.save();
        }));

        res.redirect('../projects?message=Project Created Successfully');
    } catch (error) {
        res.redirect(`../projects/create?message=${error}`);
    }
}
async function deleteProject(req, res, next){
    const id = req.params.id;
    const project = await Project.findById(id);
    
    if (!project) {
        return res.redirect(`../projects?message=There is no such Project`);
    }

    try {
        await Project.deleteOne(project);
        await User.updateMany(
            { projects: id },
            { $pull: { projects: id } }
        );
        res.redirect(`../projects`);
    } catch (error) {
        res.redirect(`../projects?message=${error}`);
    }
}
async function update(req, res, next){
    try {
        const user = req.session.user;
        const projectId = req.params.id;
        const originalProject = await Project.findById(projectId); 
        const isCreator = originalProject.creator == user._id;

        var updateFields = {};
        if (isCreator) {
            const { name, description, completed_jobs, price, start_date, end_date} = req.body;
            const archived = req.body['archived'] ? true : false;
            var users = req.body['users[]'];
            if (!Array.isArray(users)) {
                users = [users];
            }
            users.push(user._id);
            users = users.filter(value => value !== null && value !== '');
            users = new Set(users);
            users = Array.from(users);

            updateFields = {
                name,
                description,
                completed_jobs,
                price,
                start_date,
                end_date,
                users,
                archived
            };
        } else {
            const completed_jobs = req.body['completed_jobs'];
            updateFields = {
                completed_jobs
            };
        }

        const updatedProject = await Project.findByIdAndUpdate(projectId, updateFields, { new: true });
        if (!updatedProject) {
            return res.redirect('/?message=Project could not be Updated');
        }

        if(isCreator){
            const originalUsers = await User.find({ _id: { $in: originalProject.users } });
            const originalUserIds = originalUsers.map(user => user._id.toString());
            const usersToAdd = users.filter(userId => !originalUserIds.includes(userId));
            const usersToRemove = originalUserIds.filter(userId => !users.includes(userId));
            await User.updateMany(
                { _id: { $in: usersToAdd } },
                { $addToSet: { projects: projectId } }
            );
            await User.updateMany(
                { _id: { $in: usersToRemove } },
                { $pull: { projects: projectId } }
            );
        }        

        return res.redirect(`/projects/${projectId}?message=Successfully Updated Project`);
    } catch (error) {
        return res.redirect('/?message=An Error occured');
    }
}

module.exports = {
    renderProjectPage,
    renderCreateProjectPage,
    renderIndexPage,
    create,
    deleteProject,
    update
};
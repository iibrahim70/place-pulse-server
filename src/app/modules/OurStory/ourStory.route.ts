import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { OurStoryControllers } from './ourStory.controller';
import { upload } from '../../helpers/multer';

const router = Router();

router
  .route('/')

  // GET request to fetch all "Our Story" entries
  .get(OurStoryControllers.getOurStories)

  // POST request to create a new "Our Story" entry
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    upload.single('image'),
    OurStoryControllers.createOurStory,
  );

// PATCH request to update an existing "Our Story" entry by its ID
router.patch(
  '/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single('image'),
  OurStoryControllers.updateOurStoryById,
);

export const StoryRoutes = router;
